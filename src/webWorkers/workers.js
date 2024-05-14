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
      //addToRetryProfileList(key, code, 0, 0, "listarParticipantes");
    });

    postMessage("Agent's codes added to retry list!");
  });
};

const addToRetryProfileList = async (
  key,
  codAgente,
  apiCode,
  attempts,
  serviceFailed,
  done = false
) => {
  try {
    const retryKey = "retry_" + key;
    const retryParticipant = {
      codAgente,
      apiCode,
      attempts,
      serviceFailed,
      done,
    };

    let keys = [];
    const retryKeys = JSON.parse(localStorage.getItem("RETRY_KEYS"));

    if (retryKeys.length === 0) {
      keys = [retryKey];
    } else {
      keys = retryKeys.concat(retryKey);
    }
    localStorage.setItem("RETRY_KEYS", JSON.stringify(keys));

    let retryParticipants = JSON.parse(localStorage.getItem(retryKey));
    if (retryParticipants === null) {
      retryParticipants = [retryParticipant];
    } else {
      retryParticipants = retryParticipants.concat(retryParticipant);
    }
    localStorage.setItem(retryKey, JSON.stringify(retryParticipants));
  } catch (error) {
    console.log(
      `Failed to add page number ${codAgente} to Retry Participant's page list: ${error}`
    );
  }
};

export const workers = {
  bla,
  createProfilesRetryList,
};
