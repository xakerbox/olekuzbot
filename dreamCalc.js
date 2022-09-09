let startDepo = 20000;
let i = 1;

// const increaser = (startDepo) => {
//   startDepo = startDepo * 1.004;
// }
while (startDepo <= 100000) {
  startDepo = startDepo  + startDepo* 0.005;
  console.log(`День: ${i}, баланс: ${startDepo}`);
  i++
}




