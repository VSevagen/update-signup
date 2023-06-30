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

const updateSignupCTA = async (entry, environment) => {
  try {
    let signupCTAEntry = entry.fields.signupCta[LOCAL].sys.id || null;
    if(signupCTAEntry) {
      let entry = await environment.getEntry(signupCTAEntry);
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
  } catch(err) {

  }
}

const updateSignup = async (entry) => {
  try {
    if(!entry.isArchived()) {
      entry.fields.labelText1 = {
        [LOCAL]: config.icons.icon1.label
      }
      entry.fields.labelText2 = {
        [LOCAL]: config.icons.icon2.label
      }
      entry.fields.labelText3 = {
        [LOCAL]: config.icons.icon3.label
      }
      entry.fields.icon1 = {
        [LOCAL]: updateLink(config.icons.icon1.entryID, "Entry")
      }
      entry.fields.icon2 = {
        [LOCAL]: updateLink(config.icons.icon2.entryID, "Entry")
      }
      entry.fields.icon3 = {
        [LOCAL]: updateLink(config.icons.icon3.entryID, "Entry")
      }
      entry.fields.link = {
        [LOCAL]: updateLink(config.link.entryID, "Entry")
      }

      await updateSignupCTA(entry, environment);

      let updatedEntry = await entry.update();
      if(entry.isDraft()) {
        log(`Entry draft ${updatedEntry?.sys?.id}` );
        return;
      }

      let publishedEntry = await updatedEntry.publish();
      log(`Entry published ${publishedEntry?.sys?.id}` );
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