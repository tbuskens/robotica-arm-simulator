
const SimulatorCalc = require("../public_html/assets/sim-math.js")
const UI      = require("../public_html/assets/sim-ui.js")

const ui = new UI();

ui.move(15, 15, 15);
ui.getPos();
ui.move(-15, -15, -15);
ui.getPos();
ui.move(80, -80, 80);
ui.getPos();
ui.move(-280, 280, -280);
ui.getPos();
