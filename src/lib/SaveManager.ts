import SaveGame from "./SaveGame";
import { Globals } from "../globals";

export default class SaveManager {

    newGame(storyKey: string) {
        Globals.save = new SaveGame();
        Globals.save.loadNew(storyKey);
    }

    loadGame() {
        let storage = localStorage.getItem("tventures-save");
        if (storage) {
            let saveData = JSON.parse(storage);
            //console.log("LOAD: ", saveData);
            Globals.save = new SaveGame();
            Globals.save.reload(saveData);

            // Continue Story
            Globals.game.state.start('StoryLoading');
        } else {
            alert('Cannot Access any saved data.')
        }
    }

    hasSave() {
        let storage = localStorage.getItem("tventures-save");
        return (typeof(storage) !== "undefined" && storage !== null);
    }

    saveGame(returnToMenu: boolean) {
        let saveData = Globals.save.exportData();
        //console.log("SAVE: ", saveData);
        localStorage.setItem("tventures-save", JSON.stringify(saveData));

        if (returnToMenu) {
            // Return to Menu
            Globals.game.state.start('Menu');
        } else {
            alert('Progress Saved.');
        }
    }
}