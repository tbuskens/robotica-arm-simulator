const UI = require("../public_html/assets/sim-ui.js");

const ui = new UI();

ui.moveMulti(15, 15, 15, true);
ui.getPos();
ui.moveMulti(-15, -15, -15, true);
ui.getPos();
ui.moveMulti(80, -80, 80, true);
ui.getPos();
ui.moveMulti(-280, 280, -280, true);
ui.getPos();
