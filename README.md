Sibest-powered Basecamp dashboard for busy managers with many team members.

Necessary steps:
1. https://launchpad.37signals.com/integrations/
2. Application name can be anything (e.g. Sibest)
3. Company name can be whatever
4. Website URL and Redirect URI should be https://example.com
5. Product: Basecamp 4 ONLY
6. Click on the app you created
7. Paste this URL in your browser and replace it with your Client ID that you can see after clicking the app:
https://launchpad.37signals.com/authorization/new?type=web_server&client_id=YOUR_CLIENT_ID&redirect_uri=https://example.com
8.An empty example page will show up. Look at the URL of the page. There is a code like this one: (expires in ~10 mins so finish the next step quickly)
https://example.com?code=XXXXXX
9. Go to terminal or command prompt and type the following command but replace with your Client ID, Client Secret, and code respectively:
curl -X POST https://launchpad.37signals.com/authorization/token?type=web_server&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&redirect_uri=https://example.com&code=Your_Code
10. Make a folder where you want the program to sit
11. Use cd in your terminal to get to that folder (for example cd Sibest-central)
12. Once you're done, type git clone <repo url> (now you copied the project to file essentially and can receive updates with simple commands)
13. In your terminal type: npm install (installs necessary files to run code)
14. Type in a terminal window node server.js and don't close it as long as you want the website to keep running
15. 
