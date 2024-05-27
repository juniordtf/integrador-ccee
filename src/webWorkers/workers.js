import { db } from "../database/db.js";

var bla = async () => {
  // eslint-disable-next-line no-restricted-globals
  self.addEventListener("message", async (e) => {
    // eslint-disable-line no-restricted-globals
    if (!e) return;

    console.log("Bla called: " + JSON.stringify(e.data));
    const users = [];

    const userDetails = {
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      id: 1,
    };

    for (let i = 0; i < 10000000; i++) {
      userDetails.id = i++;
      userDetails.dateJoined = Date.now();

      users.push(userDetails);
    }

    postMessage(users);
  });
};

var createProfilesRetryList = async () => {
  // eslint-disable-next-line no-restricted-globals
  self.addEventListener("message", async (e) => {
    // eslint-disable-line no-restricted-globals
    if (!e) return;

    let payload = e.data;
    let sourceItems = payload.codAgentes;
    let key = payload.key;

    sourceItems.forEach(async (code) => {
      addGenericFaultyRequest(key, code, 0, "listarParticipantes", 0);
    });

    postMessage("Agent's codes added to retry list!");
  });
};

async function addGenericFaultyRequest(
  key,
  requestCode,
  apiCode,
  serviceRequested,
  attempts
) {
  try {
    await db.genericFaultyRequest.add({
      key,
      requestCode,
      apiCode,
      serviceRequested,
      attempts,
    });
  } catch (error) {
    console.log(
      `Failed to add Topology for resource: ${requestCode}: ${error}`
    );
  }
}

export const workers = {
  bla,
  createProfilesRetryList,
};
