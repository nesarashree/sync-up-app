# SyncUp: Match, Study, Repeat
*CS 278 Final Project*

Stanford students often face an invisible challenge: studying alone. While group work and social learning are known to boost academic outcomes, the tools for forming academic partnerships are nonexistent. SyncUp is a sociotechnical system designed to fill this gap, helping students find study partners, amass a peer network, and stay accountable through lightweight, intentional connections. 

Our target audience is students seeking structure and motivation, particularly around major deadlines like finals or midterms. SyncUp combines a swipe-based discovery model (inspired by Tinder, our piggyback prototype) with features tuned for academic contexts and norms that promote reciprocity.

## Watch the demo
Overview of SyncUp's key features, including the onboarding/profile creation process, swipe-to-match feature, app screens, local DMs and group chat dropdown, calendar integration, preliminary matching algorithm, and more.
<div align="center">
  <a href="https://drive.google.com/file/d/1ckzARhFVm-Y4sLhnfFFRLH2NFjnR2l_b/view?usp=sharing" target="_blank">
    <img src="images/logo2.png" alt="Watch the demo" width="500"/>
  </a>
</div>

## Paper — Sociotechnical Design 
Examining the sociotechnical concepts driving SyncUp, our final paper discusses how our design choices facilitate meaningful academic connections. We analyze pilot data demonstrating how group features lowered barriers to meetups and increased engagement. We also outline future directions for scaling, intelligent matching, and privacy considerations.

https://docs.google.com/document/d/16cV8kAuYDsp79qpN7NfNefhikznAIS7AkAAGl79JkBo/edit?usp=sharing

## Development
The SyncUp app is a dynamic web application built with [React](https://react.dev/) and Firebase.

**Frontend:**
* React.js - JavaScript library for building user interfaces.
* Create React App - For bootstrapping the React project.
* HTML5, CSS3, JavaScript (ES6+)

**Backend & Database:**
* Firebase Authentication - for user authentication.
* Firebase Firestore - NoSQL cloud database for data storage.
* Firebase Hosting - For deploying the web application.

**Package Management:**
npm

## Instructions for Use

Follow these steps to get the SyncUp app running locally on your machine for development and testing. Make sure you have *Node.js* (LTS recommended) and *npm* installed.

1. Open your terminal
2. Clone the repository and navigate into the React app by running the following commands:
   ```bash
   git clone https://github.com/nesarashree/sync-up-app.git
   cd sync-up-app/syncup-react
   ```
3. Install dependencies: `npm install`
4. Start the development server: `npm start`
5. Open your web browser and go to `http://localhost:3000`

You should now see the SyncUp app running locally!

**Notes**
- Before running the app, make sure your Firebase configuration is set up properly in the project (usually in a `.env` file or config file).
- To create a production build, run: `npm run build`
- To deploy the app to Firebase Hosting (if Firebase CLI is configured): `firebase deploy`
