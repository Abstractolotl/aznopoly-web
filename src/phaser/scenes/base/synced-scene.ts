import AzNopolyGame from "../../../game";
import { SceneSwitcher } from "../../../util/scene-switcher";
import { BaseScene } from "./base-scene";
import SyncedSceneController from "./synced-scene-controller";


export default abstract class SyncedScene<T extends SyncedSceneController> extends BaseScene<T> {

}