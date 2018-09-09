
export let ASSETS = {
  "loadingBar": "./assets/images/loader-bar.png",
  "loaderBg": "./assets/images/loader-bg.png",
  "melody": "./assets/sounds/melody-8bit.mp3",
  "blackGradient": "./assets/images/bg_black_gradient01.png",
  "menuBg01": "./assets/images/menu_bg01.png",
  "menuBgCircle01": "./assets/images/menu_bg_circle01.png",
  "menuBgCircle02": "./assets/images/menu_bg_circle02.png",
  "menuBgCircle03": "./assets/images/menu_bg_circle03.png",
  "menu01": "./assets/images/menu_sprite01.png",
  "menu02": "./assets/images/menu_sprite02.png",
  "icons": "./assets/images/icons_01.png",
  "slider01": "./assets/images/slider01_sprite.png",
  "slider01_back": "./assets/images/slider01_back.png",
  "slider02_back": "./assets/images/slider02_back.png",
  "rectangle_black": "./assets/images/primitive_rectangle_black.png",
  "buttons": "./assets/images/buttons.png",
  "dice": "./assets/images/diceWhite.png",
  "dice_red": "./assets/images/diceRed.png",
  "close_btn": "./assets/images/close_btn.png",
  "modal_bg": "./assets/images/modal_bg.png"
};

export let STORYBOOKS = [
  {
    Key: "TWIN_TERROR",
    Name: "Twin Terror",
    StartingNode: "0",
    Assets: [
      { type: "audio", path: "./assets/sounds/kids-laughing-then-crying.mp3", target: "kids_opening" },
      { type: "audio", path: "./assets/sounds/monster-coming.mp3", target: "monster_coming" },
      { type: "audio", path: "./assets/sounds/outside-running.mp3", target: "outside_running" },
      { type: "audio", path: "./assets/sounds/monster-growl.mp3", target: "monster_growl" },
      { type: "audio", path: "./assets/sounds/monster-roar.mp3", target: "monster_roar" },
      { type: "audio", path: "./assets/sounds/girl-cry.mp3", target: "girl_crying" },
      { type: "audio", path: "./assets/sounds/boy-car.mp3", target: "boy_car" },
      { type: "audio", path: "./assets/sounds/floor-creak.wav", target: "floor_creak" },
      { type: "audio", path: "./assets/sounds/girl-happy.mp3", target: "girl_happy" }
    ]
  }
];

export let CONFIG = {
  gameWidth: 800,
  gameHeight: 640,
  gameMinWidth: 400,
  gameMinHeight: 300,
  localStorageName: 'tventures',
  copyrightDate: '2018',
  debugMode: true,
  webfonts: ['Fira Sans:500']
};