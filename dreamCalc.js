let startDepo = 2000;
let i = 1;

// const increaser = (startDepo) => {
//   startDepo = startDepo * 1.004;
// }
while (startDepo <= 6000) {
  startDepo = startDepo  + startDepo* 0.004;
  console.log(`День: ${i}, баланс: ${startDepo}`);
  i++
}




