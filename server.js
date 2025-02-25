const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let users = {};

let userSessions = {}; // Store users and their partner's connection
let waitingUsers = {}; 

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'register') {
      
      users[data.myId] = ws;
     
    }
    
    if (data.type === "connect") {
      const { myId, partnerId } = data;

      // console.log("userSessions[partnerId]",userSessions[partnerId])
      // console.log("myId",myId)
      // if(userSessions[partnerId]){
      //   console.log("User found")

      // }

      // if(userSessions[partnerId].partnerId === myId){
      //   console.log("User found 222")
      // }


      // Check if partner is already connected
      if (userSessions[partnerId] && userSessions[partnerId].partnerId === myId) {
        console.log(`User ${myId} and ${partnerId} are now connected!`);

        userSessions[myId] = { ws, partnerId };
        userSessions[partnerId].ws.send(JSON.stringify({ type: "connectionSuccess", isFirst: false, myId : partnerId  , partnerId: myId }));
        ws.send(JSON.stringify({ type: "connectionSuccess", isFirst: true ,myId, partnerId }));

      } else {
        // Store user in waitingUsers list
        // console.log("user - ",users[partnerId]);
        console.log(`PART 2------------------------------------------------------------------------`);
        console.log(`User ${myId} is waiting for partner ${partnerId}...`);
        //waitingUsers[myId] = { ws, partnerId };
        userSessions[myId] = { ws, partnerId: partnerId };
        console.log("user", users);
        users[partnerId].send(JSON.stringify({ type: "partnerWaiting", waitingPartner: myId }));
      }
    }

    if (data.type === "receiveActivities") {
      console.log("receiveActivities");
      const partnerSocket = userSessions[data.partnerId]?.ws || waitingUsers[data.partnerId]?.ws;
      if (partnerSocket) {
        console.log("send receiveActivities",data.partnerId);
        
        partnerSocket.send(JSON.stringify({ type: "receiveActivitiesBack",partnerId: data.myId, activities: data.activities, myId: data.partnerId , toze : 'ola' , 'test': data.partnerId  }));
      }
    }

    if (data.type === "finalActivities") {
      console.log("finalActivities",data.partnerId);
      console.log("finalActivities",userSessions[data.partnerId]);
     
      const partnerSocket = userSessions[data.partnerId]?.ws || waitingUsers[data.partnerId]?.ws;
      if (partnerSocket) {

        console.log("send finalActivities",data.partnerId);
        console.log("send finalActivities",data.myId);
        partnerSocket.send(JSON.stringify({ type: "finalActivities", activities: data.activities , myId : data.partnerId , partnerId: data.myId }));
      }
    }

    if (data.type === "swipe") {
      console.log("UM SWIPE RIGHT");
      console.log("UM SWIPE RIGHT MY ID", data.myId);
      console.log("UM SWIPE RIGHT PARTNER ID", data.partnerId);
      const partnerSocket = userSessions[data.partnerId]?.ws || waitingUsers[data.partnerId]?.ws;
      if (partnerSocket) {
        partnerSocket.send(JSON.stringify({ type: "userRight", activity: data.activity }));
      }
    }

    if (data.type === "swipeMatch") {
      const partnerSocket = userSessions[data.partnerId]?.ws || waitingUsers[data.partnerId]?.ws;
      if (partnerSocket) {
        partnerSocket.send(JSON.stringify({ type: "swipeMatch", activity: data.activity }));
      }
    }

  });

  ws.on("close", () => {
    console.log("User disconnected");
    for (let userId in userSessions) {
      if (userSessions[userId].ws === ws) {
        delete userSessions[userId];
        break;
      }
    }
    for (let userId in waitingUsers) {
      if (waitingUsers[userId].ws === ws) {
        delete waitingUsers[userId];
        break;
      }
    }
  });
});

console.log('WebSocket server running on ws://localhost:8080');
