### Steps (Manual configuration before running script)
1. Update content model for signup with 2 new fields
  - Subtitle - Short Text field
  - Link - Reference field (Link type only)
2. Upload the 3 new assets in the asset section for contentful. Refer to US market for the assets
3. Create 3 new Icon entry with the 3 new assets uploaded and add the entryID for the 3 icons in the config.json file
4. Create a new Link entry and add the entryID for the Link in the config.json file

### Goal
This script will update all signup components except the ones where the title contains any substrings from config.excludedSignups.
For the ones which will be updated, everything (title, subtitle, icons, labeltext, link, signupcta), except the VortexScenario, will be updated.