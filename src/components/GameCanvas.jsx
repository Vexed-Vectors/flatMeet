// src/components/GameCanvas.js
import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { initializeSocket } from "../socket";
import { useDispatch, useSelector } from "react-redux";

const GameCanvas = () => {
  const gameRef = useRef(null);
  const dispatch = useDispatch();
  const initialOtherPlayers = useSelector((state) => state.players);
  console.log("INITIAL OTHER PLAYERS: ", initialOtherPlayers);

  useEffect(() => {
    const socket = initializeSocket(dispatch);
    const tileSize = 16;
    let player;
    let clientId = socket.id;
    let otherPlayers = Object.entries(initialOtherPlayers || {})
      .filter(([id]) => id !== socket.id)
      .map((id, value) => ({
        id: id,
        x: value.x,
        y: value.y,
      }));
    otherPlayers = Object.entries(initialOtherPlayers).filter(
      ([id]) => id !== clientId
    );

    class GameScene extends Phaser.Scene {
      constructor() {
        super({ key: "GameScene" });
        this.player = null;
        this.cursors = null;
        this.otherPlayerSprites = {};
        this.moveCooldown = 0;
        this.moveDelay = 150;
      }

      preload() {
        this.load.image(
          "tiles",
          process.env.PUBLIC_URL + "/assets/dungeon1.png"
        );
        // this.load.tilemapTiledJSON(
        //   "map",
        //   process.env.PUBLIC_URL + "/assets/map.json"
        // );
        this.load.spritesheet(
          "player",
          "https://labs.phaser.io/assets/sprites/phaser-dude.png",
          {
            frameWidth: 32,
            frameHeight: 48,
          }
        );
      }

      create() {
        const bg = this.add.image(0, 0, "tiles").setOrigin(0, 0);
        console.log("OTHER PLAYERS: ", otherPlayers);
        bg.setDisplaySize(
          this.sys.game.config.width,
          this.sys.game.config.height
        ); // Stretch to fit

        player = this.physics.add.sprite(tileSize * 5, tileSize * 5, "player");

        this.player = player;
        this.cameras.main.startFollow(this.player);
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.otherPlayerSprites = {};
        Object.entries(otherPlayers).forEach((player) => {
          console.log("Adding other player sprite: ", player[1]);
          this.otherPlayerSprites[player[1][0]] = this.add.sprite(
            player[1][1].x,
            player[1][1].y,
            `player`
          );
        });
        console.log("Other players sprites: ", this.otherPlayerSprites);

        socket.onmessage = (msg) => {
          const data = JSON.parse(msg.data);

          console.log("OTHER PLAYERS: ", otherPlayers);

          if (data.type === "move" && data.id !== socket.id) {
            if (!this.otherPlayerSprites[data.id]) {
              this.otherPlayerSprites[data.id] = this.add.sprite(
                data.x,
                data.y,
                "player"
              );
            } else {
              this.otherPlayerSprites[data.id].x = data.x;
              this.otherPlayerSprites[data.id].y = data.y;
            }
          }

          if (data.type === "leave") {
            if (this.otherPlayerSprites[data.id]) {
              this.otherPlayerSprites[data.id].destroy();
              delete this.otherPlayerSprites[data.id];
            }
          }
        };

        this.cameras.main.setBounds(0, 0, tileSize * 20, tileSize * 20);
      }

      update(time, delta) {
        let moved = false;
        this.moveCooldown -= delta;

        if (this.moveCooldown <= 0) {
          if (this.cursors.left.isDown) {
            this.player.x -= tileSize;
            this.moveCooldown = this.moveDelay;
            moved = true;
          } else if (this.cursors.right.isDown) {
            this.player.x += tileSize;
            this.moveCooldown = this.moveDelay;
            moved = true;
          } else if (this.cursors.up.isDown) {
            this.player.y -= tileSize;
            this.moveCooldown = this.moveDelay;
            moved = true;
          } else if (this.cursors.down.isDown) {
            this.player.y += tileSize;
            this.moveCooldown = this.moveDelay;
            moved = true;
          }

          this.player.x = Phaser.Math.Clamp(
            this.player.x,
            this.player.width,
            tileSize * 20 - this.player.width
          );
          this.player.y = Phaser.Math.Clamp(
            this.player.y,
            this.player.height,
            tileSize * 20 - this.player.height
          );
        }
        if (moved) {
          console.log("player has moved");
          socket.send(
            JSON.stringify({
              type: "move",
              x: player.x,
              y: player.y,
              id: socket.id,
            })
          );
        }
      }
    }

    if (!gameRef.current) {
      const config = {
        type: Phaser.AUTO,
        width: 320,
        height: 320,
        parent: "game-container",
        backgroundColor: "#e0e0e0",
        pixelArt: true,
        physics: {
          default: "arcade",
          arcade: { debug: false },
        },
        scene: GameScene,
      };

      gameRef.current = new Phaser.Game(config);
    }
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [dispatch, initialOtherPlayers]);

  return <div id="game-container" />;
};

export default GameCanvas;
