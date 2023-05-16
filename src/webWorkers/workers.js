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

export const workers = {
  bla,
};
