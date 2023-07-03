const contentful = require("contentful-management");
const config = require("./config.json");
const log = require("./log");

const ACCESS_TOKEN = config.accessToken;
const SPACEID = config.space.spaceID
const ENVIRONMENTID = config.space.environment;
const CONTENT_TYPE = config.contentType.id;
const LOCAL = config.space.locale;

const client = contentful.createClient({
  accessToken: ACCESS_TOKEN
});

const updateLink = (entryID, type) => {
  return ({
    "sys": {
      "type": "Link",
      "linkType": type,
      "id": entryID
   }
  })
}
/**
 * Function to check whether entry title contains any words from the excludedSignups array
 * Any signup title containing any word from the excludedSignups array will be rejected
 * @param {*} entryTitle
 * @returns boolean (true or false)
 */
function checkTitle(entryTitle) {
  for(const word of config.excludedSignups) {
    if(entryTitle.includes(word)) {
      return true;
    }
  }

  return false;
}

/**
 * Function to update the SignupCTA label
 * @param {*} entry
 * @param {*} environment
 * @returns void
 */
const updateSignupCTA = async (entry, environment) => {
  try {
    let signupCTAEntry = entry.fields.signupCta[LOCAL].sys.id || null;
    if(signupCTAEntry) {
      let entry = await environment.getEntry(signupCTAEntry);
      if(entry.fields.labelText[LOCAL] !== config.signupCTA) {
        entry.fields.labelText = {
          [LOCAL]: config.signupCTA
        }

        let updatedEntry = await entry.update();
        if(entry.isDraft()) {
          log(`Entry signupCTA draft ${updatedEntry?.sys?.id}` );
          return;
        }

        let publishedEntry = await updatedEntry.publish();
        log(`Entry signupCTA published ${publishedEntry?.sys?.id}` );
      }
    }
  } catch(err) {

  }
}

/**
 * Function to update the signup component
 * Values updated (IF TITLE DOES NOT CONTAIN WORDS FROM EXCLUDEDSIGNUP ARRAY IN CONFIG):
 * - Title
 * - Subtitle
 * - Label Text 1
 * - Icon 1
 * - Label Text 2
 * - Icon 2
 * - Label Text 3
 * - Icon 3
 * - Link
 * @param {*} entry
 * @param {*} environment
 * @returns
 */
const updateSignup = async (entry, environment) => {
  try {
    if(!entry.isArchived()) {

      // Check if title contains excluded signups substrings
      if(!checkTitle(entry.fields.title[LOCAL].toLowerCase())) {

        // Update Title
        entry.fields.title = {
          [LOCAL]: config.title
        }

        // Update Subtitle
        entry.fields.subtitle = {
          [LOCAL]: config.subtitle
        }

        // Update LabelText1
        entry.fields.labelText1 = {
          [LOCAL]: config.icons.icon1.label
        }

        // Update LabelText2
        entry.fields.labelText2 = {
          [LOCAL]: config.icons.icon2.label
        }

        // Update LabelText3
        entry.fields.labelText3 = {
          [LOCAL]: config.icons.icon3.label
        }

        // Update Icon 1
        entry.fields.icon1 = {
          [LOCAL]: updateLink(config.icons.icon1.entryID, "Entry")
        }

        // Update Icon 2
        entry.fields.icon2 = {
          [LOCAL]: updateLink(config.icons.icon2.entryID, "Entry")
        }

        // Update Icon 3
        entry.fields.icon3 = {
          [LOCAL]: updateLink(config.icons.icon3.entryID, "Entry")
        }

        // Update Link
        entry.fields.link = {
          [LOCAL]: updateLink(config.link.entryID, "Entry")
        }

        // Update SignupCTA label text
        await updateSignupCTA(entry, environment);

        let updatedEntry = await entry.update();

        if(entry.isDraft()) {
          log(`Entry draft ${updatedEntry?.sys?.id}` );
          return;
        }

        let publishedEntry = await updatedEntry.publish();
        log(`Entry published ${publishedEntry?.sys?.id}` );
      }

    }
  } catch(err) {
    log(`Error on updateSignup ${err}` );
  }
}

const run = async () => {
  try {
    log(`DATE: ${new Date()}`);
    // Get contentful space
    let space = await client.getSpace(SPACEID);
    // Get contentful environment
    let environment = await space.getEnvironment(ENVIRONMENTID);

    // Get all signup entries
    const entries = await environment.getEntries({'content_type': CONTENT_TYPE, limit: 1000});
    for(const entry of entries.items) {
      await updateSignup(entry, environment);
    }

  } catch(err) {
    log(`Error occured on run step ${err}`);
  }
}

run();