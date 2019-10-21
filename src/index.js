//Styles
import './index.scss';

//JS
import "bootstrap";
import Vue from "vue";
import VueFullscreen from "vue-fullscreen";
import $ from "jquery";
import Board from "./board.js";


let isPlaying = false;
let shiftX = 10;
let shiftY = 10;

const minWidthCanvas = 1000;
let widthCanvas = 0;
let widthBoard = 0;
let heightCanvas = 0;
let heightBoard = 950;

let colors = {
	"text": "#000",
	"border": "#cccccc",
	"cardBorder": "#333333",
	"ready": "#b800dd",
	"analysis": "#ce1212",
	"development": "#1266cf",
	"testing": "#008100",
	"deployed": "#000000"
};

let config = {};
let board = null;
let tracing = [];

Vue.component("b-cards", {
	props: ["cards"],
	template: "<div><b-card :card=\"card\" v-for=\"(card) in cards\"></b-card></div>"
});

Vue.component("b-card", {
	props: ["card"],
	template: "<table class=\"b-card\">" +
        "<tr><td v-html=\"card.cardId\"></td></tr>" +
       "<tr v-for=\"(estimation, stage) in card.estimations\"><td><template v-for=\"(i) in estimation\">" +
       "<b-estimation :stage=\"stage\" :burned=\"i <= estimation - card.remainings[stage]\"></b-estimation>" +
       "</template></td></tr>" +
       "</table>"
});

Vue.component("b-estimation", {
	props: ["stage", "burned"],
	template: "<div :class=\"'b-'+stage + ' b-estimation' + (burned ? ' b-burned-' +  stage: '' )\"></div>"
});

Vue.use(VueFullscreen);
let app = new Vue({
	el: "#app",
	data: {
		startButton: "goooo",
		resetButton: "ne robit",
		fullscreenButton: "fullscr",
		toggles: {
			isFullscreen: false,
		},
		info: {
			cfd: {
				name: "Cumulative flow diagram",
				description: "How many issues is in progress",
				styleClass: "info_positive",
				sign: "",
				value: 0,
				visible: false
			},
			cc: {
				name: "Control Chart",
				description: "Average issue cycleTime",
				styleClass: "info_positive",
				sign: "",
				value: 0,
				visible: false
			},
			dd: {
				name: "Distribution diagram",
				description: "",
				styleClass: "info_positive",
				sign: "",
				value: 0,
				visible: false
			}
		},
		stageConfigs: {
			limit: "Limit",
			diceCount: "Workers",
			delay: "Delay"
		},
		stages: {
			ready: {
				limit: 4,
				isInnerDone: false,
				cards: {
					wip: []
				}
			},
			analysis: {
				limit: 2,
				diceCount: 2,
				complexity: 2,
				diceIcon: "👩🏻‍🦰",
				//averageUtilization: 0,
				isInnerDone: true,
				cards: {
					wip: [],
					done: []
				}
			},
			development: {
				limit: 4,
				diceCount: 3,
				complexity: 1,
				diceIcon: "🧔🏻",
				//averageUtilization: 0,
				isInnerDone: true,
				cards: {
					wip: [],
					done: []
				}
			},
			testing: {
				limit: 3,
				diceCount: 2,
				complexity: 3,
				diceIcon: "👱🏽‍♀",
				//averageUtilization: 0,
				isInnerDone: false,
				cards: {
					wip: []
				}
			},
			done: {
				isInnerDone: false,
				cards: {
					wip: []
				}
			},
			deployed: {
				delay: 3,
				isInnerDone: false,
				cards: {
					wip: []
				}
			}
		},
		boardData: {}
	},
	methods: {
		construct: function () {
			tracing = [];
			config.stages = Object.keys(this.stages).map(key => {
				let stage = {};
				Object.assign(stage, this.stages[key]);
				stage.name = key;
				return stage;
			});
			board = new Board(config);
		},
		about: function () {
			return window.open("https://google.com");
		},
		reset: function () {
			if (isPlaying) {
				this.startToggle();
			}
			this.construct();
		},
		startToggle: function () {
			isPlaying = !isPlaying;
			this.startButton = isPlaying ? "⏸" : "▶";
			this.tickDown();
		},
		handleResize: function () {
			if (!isPlaying && board !== null) {
				this.tickDown();
			}
		},
		handleKey: function (event) {
			if (event.keyCode === 70) {
				this.toggles.isFullscreen = !this.toggles.isFullscreen;
			} else if (event.keyCode === 83) {
				this.startToggle(event);
			} else if (event.keyCode === 82) {
				this.reset(event);
			}
		},
		tickDown: function () {
			this.boardData = isPlaying ? board.turn() : board.view();
			Object.keys(this.boardData.utilization).forEach(stageName => {
				this.stages[stageName].averageUtilization = this.boardData.utilization[stageName].average;
			});

			Object.keys(this.boardData.columns).forEach(stageName => {
				this.stages[stageName].cards = this.boardData.columns[stageName];
			});
			this.$forceUpdate();
			this.draw();
			if (isPlaying) {
				setTimeout(this.tickDown, 1000);
			}
		},
		// draw: function () {
		// 	widthCanvas = window.innerWidth * 0.33,//Math.max(window.innerWidth * 0.25, minWidthCanvas);
		// 	widthBoard = widthCanvas - 2 * shiftX;
		// 	heightCanvas = (minWidthCanvas / 1.68) + (widthCanvas - minWidthCanvas) * 0.2;
		// 	heightBoard = heightCanvas - 2 * shiftY;
		// 	$("canvas").attr("width", widthCanvas);
		// 	$("canvas").attr("height", heightCanvas);
		// 	drawCFD(document.getElementById("cfd").getContext("2d"), this.boardData);
		// 	drawCC(document.getElementById("cc").getContext("2d"), this.boardData);
		// 	drawDD(document.getElementById("dd").getContext("2d"), this.boardData);
		// }
	},
	created() {
		window.addEventListener("resize", this.handleResize);
		window.addEventListener("keyup", this.handleKey);
		this.handleResize();
	},
	mounted() {
		this.construct();
		this.tickDown();
	},
	updated() {
		config.stages = Object.keys(this.stages).map(key => {
			let stage = {};
			Object.assign(stage, this.stages[key]);
			stage.name = key;
			return stage;
		});
		board.updatedConfig(config);
	},
	destroyed() {
		window.removeEventListener("resize", this.handleResize);
		window.removeEventListener("keyup", this.handleKey);
	}
});

function drawLabel(ctx, x, y, font, color, value) {
	ctx.font = font;
	ctx.fillStyle = color;
	ctx.fillText(value, x, y);
}

