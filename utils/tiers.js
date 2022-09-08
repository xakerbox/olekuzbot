const showTier = (currentTier) => {
  const tier = currentTier
    .filter((el) => el === 1)
    .map((el, index) => {
      switch (index) {
        case 0:
          return "0️⃣";
        case 1:
          return "1️⃣";
        case 2:
          return "2️⃣";
        case 3:
          return "3️⃣";
        case 4:
          return "4️⃣";
        case 5:
          return "5️⃣";
      }
    });

  console.log("TIER:", ...tier);
};

module.exports = { showTier };
