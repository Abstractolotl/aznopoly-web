import AzNopolyGame from '../src/game'
import NetworkSceneController from '../src/scene/base/base-scene-controller';
import {EventEmitter} from 'eventemitter3';
import Phaser from 'phaser';


it("should create a new controller", () => {
    class TestController extends NetworkSceneController {
        onSceneCreate(): void {
        }
        public bobo: number = 0;
        public exampleMethod(num: number) {
            this.bobo = num;
        }
    }
    
    let scene = {} as Phaser.Scene;
    let aznopoly = {} as AzNopolyGame;
    let controller!: TestController;
    
    beforeEach(() => {
        scene = {
            events: new EventEmitter()
        } as any as Phaser.Scene;
    
        aznopoly = {
            broadcastPacket: () => {},
            isPlayerHost: () => true,
        } as any as AzNopolyGame;
    
    
        (global as any).Phaser = {
            Scenes: {
              Events: {
                SHUTDOWN: 'shutdown',
                CREATE: 'create',
              }
            }
        };
        controller = new TestController(scene, aznopoly);
    })
    
    describe('Proxy call', () => {
        controller.registerSyncedMethod(controller.exampleMethod, false);
    
        controller.syncProxy.exampleMethod(5)
        expect(controller.bobo).toBe(5);
    })
    
    describe('Proxy call not allowed', () => {
        expect(() => controller.syncProxy.exampleMethod(5)).toThrow();
    })
    
    describe('Proxy call not allowed by host', () => {
        controller.registerSyncedMethod(controller.exampleMethod, true);
    
        (aznopoly as any).isHost = false;
        expect(() => controller.syncProxy.exampleMethod(5)).toThrow();
    })
    
    describe('Proxy call allowed by host', () => {
        controller.registerSyncedMethod(controller.exampleMethod, true);
    
        (aznopoly as any).isHost = true;
        controller.syncProxy.exampleMethod(5);
        expect(controller.bobo).toBe(5);
    })
    
    describe('Proxy call sends packet', () => {
        controller.registerSyncedMethod(controller.exampleMethod, false);
        
        let packet;
        aznopoly.broadcastPacket = (p: any) => packet = p;
    
        controller.syncProxy.exampleMethod(5);
        expect(packet).toEqual({
            type: 'CLIENT_MINIGAME_TESTCONTROLLER',
            data: {
                method: 'exampleMethod',
                arguments: [5],
            }
        });
    })
    
    describe('Receiving packet will call method', () => {
        controller.registerSyncedMethod(controller.exampleMethod, false);
    
        let listener!: EventListener;
        (aznopoly as any).addPacketListener = (_: string, l: EventListener) => {
            listener = l;
        };
    
        scene.events.emit(global.Phaser.Scenes.Events.CREATE);
        expect(listener).toBeDefined();
        
        let packet = {
            type: 'CLIENT_MINIGAME_TESTCONTROLLER',
            data: {
                method: 'exampleMethod',
                arguments: [5],
            }
        }
        listener(new CustomEvent('test', {detail: packet}) as any);
        expect(controller.bobo).toBe(5);
    });
});