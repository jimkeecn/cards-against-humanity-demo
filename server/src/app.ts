//npx ts-node src/foo.ts
//import express, {Request,Response,Application} from 'express';
import express = require("express");
import { Room , PlayerDTO, Player, GamePlayer, PickCompleteDTO, Question, Card, RoomDTO, RoomInput } from './models/model';
import { Server } from "socket.io";
const cors = require('cors');
import { createServer } from "http";
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 8000;
// app.set("port",PORT);
// const cors = require('cors');
// app.use(cors());

const app = express();

app.use(cors({
    origin: 'http://localhost:4200'
}));

app.use(express.urlencoded({extended: true}));
app.use(express.json()) // To parse the incoming requests with JSON payloads

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:4200"
  }
});

var room_list: Room[] = [];
var active_player_list: Player[] = [];
const questions = [];
const cards = [];


io.on('connection', async (socket: any) => { 

    let disconnectedCount = 0;

    //await updateSocketToUser();

    async function updateSocketToUser() {
        let socket_user = await getHandshakeAuth();
        console.log("New player connected : \n" + JSON.stringify(socket_user) + "\n" +socket.id + "\n");
        let user = active_player_list.find(x => { 
            if (x.uniqueId == socket_user.uniqueId) {
                return x
            }
        })
        if (user) {
            user.socketId = socket.id;
        }
    }

    
    console.info(`there are ${active_player_list.length} players`);
    console.info(`there are ${room_list.length} rooms`);

    socket.on("disconnect", async (reason) => { 
        let socket_user = await getHandshakeAuth();
        console.info(`disconnect | ${socket_user ? socket_user.userName : socket_user} is disconnected`);
        let room = getMyRoom(socket_user.uniqueId);
        console.info('disconnect room |' + room);
        if (room) {
            await leaveRoom(room.uniqueId);
        }
    })
    
    socket.on("checkMyExist$", async () => { 
        console.log("checkMyExist$");
        let player = await getMyDetailByUniqueId();
        if (player == null) {
            socket.emit('$404');
        } else {
            socket.emit('$200',player);
        }
    })

    socket.on("createNewRoom$", async (param:RoomInput) => { 
        //check if I have room already
        let socket_user = await getHandshakeAuth();
        if (socket_user == null) {
            socket.emit('$404');
            return;
        }
        console.log("createNewRoom$ 1|  " + socket_user + "," + socket_user.uniqueId);
        let myRoom = getMyRoom(socket_user.uniqueId);

        if (myRoom != null) {
            console.error("createNewRoom$ 2| This player has a room already");
            return;
        }

        //Find who is creating this game.
        console.info(`createNewRoom$ 3| ${JSON.stringify(active_player_list)}`);

        // let owner = active_player_list.find(x => {
        //     console.log(`createNewRoom$ | literal player ${JSON.stringify(x)} && ${socket_user.uniqueId}`)
        //     if (x.uniqueId == user_id) {
        //         return x;
        //     }
        // });

        
        for (let x = 0; x < active_player_list.length; x++){
            console.log("createNewRoom$ 4|" + socket_user.uniqueId + "," + active_player_list[x].uniqueId);
            if (active_player_list[x].uniqueId === socket_user.uniqueId) {
                let owner = active_player_list[x]

                //If owner not existing, server error
                console.info(`createNewRoom$ 5| ${JSON.stringify(owner)}`);
                if (owner == null) {
                    console.error("createNewRoom$ 6| Cannot find owner from active player list");
                    return;
                }

                //create the new room..
                let room = createNewRoom(owner,param);
                room_list.push(room);
                console.log(room_list);
                socket.join(room.uniqueId);
                $getRoomId(room.uniqueId);
            }
        }

      
    })

    socket.on("refreshRoom$", () => { 
        socket.emit('$roomList', getAvailableGameDTO());
    })


    socket.on("joinRoom$", async (roomId: string) => { 

        let socket_user = await getHandshakeAuth();
        let player = await joinRoom(roomId);
        let playerDTO: PlayerDTO = {
            uniqueId: player.uniqueId,
            userName: player.userName
        }
        socket.join(roomId);
        $joinRoom(roomId, playerDTO);
        console.log(socket_user.userName, roomId);

    })

    socket.on("leaveRoom$", async (roomId: string) => { 
        let socket_user = await getHandshakeAuth();
        if (socket_user == null) {
            socket.emit('$404');
        }
        room_list.forEach((x, index) => { 
            /**
             * If the owner leave the room. destroy the whole room and
             * make all socket leave the room
             */
            if (x.owner.uniqueId == socket_user.uniqueId) {
                room_list.splice(index, 1);
                $ownerDisconnected(x.uniqueId);
                io.socketsLeave(x.uniqueId);
            }

            /**
             * If not the owner leave the room. 
             * just make the user leave the room.
             */
            if (x.uniqueId == roomId) {
                 x.activePlayerList.forEach((y, index) => { 
                    if (y.uniqueId == socket_user.uniqueId) {
                        x.activePlayerList.splice(index, 1);
                        socket.leave(x.uniqueId);
                        $leaveRoom();
                    }
                })
            }
        })
    })

    async function leaveRoom(roomId) {
        let socket_user = await getHandshakeAuth();
        room_list.forEach((x, index) => { 
            /**
             * If the owner leave the room. destroy the whole room and
             * make all socket leave the room
             */
            if (x.owner.uniqueId == socket_user.uniqueId) {
                console.log("owner leaves room")
                room_list.splice(index, 1);
                $ownerDisconnected(x.uniqueId);
                io.socketsLeave(x.uniqueId);
            }

            /**
             * If not the owner leave the room. 
             * just make the user leave the room.
             */
            if (x.uniqueId == roomId) {
                 x.activePlayerList.forEach((y, index) => { 
                    if (y.uniqueId == socket_user.uniqueId) {
                        console.log("player leaves room")
                        x.activePlayerList.splice(index, 1);
                        socket.leave(x.uniqueId);
                        $leaveRoom();
                    }
                })
            }
        })
    }

    socket.on("startGame$", () => { 
        var room = getMyRoom(socket.id);
        if (room == null) {
            console.error("startGame$ | Cannot find your room.");
            return;
        }
        //Set the game as start and broadcast to everyone in the game
        startGame(room.uniqueId, socket.id);
        
        //Set the first judge and broadcast to everyone in the game
        var judge = pickFirstJudge(room);

        room.rounds.push({
            index: 1,
            question: first_question,
            picks: [],
            status: 'initiating',
            judge: { ...judge },
            answer:null
        })


        setTimeout(() => { 
            $pickJudge(room, room.rounds[room.rounds.length - 1].judge);
        }, 1000)
        
        //get cards for each player
        assignPlayerCards(room,10);
        setTimeout(() => { 
            $initCards(room);
        }, 3000)
        

        //get the first question
        var first_question= getRandomQuestion(room);
        setTimeout(() => { 
            $currentQuestion(room, first_question);
            $startRound(room);
        }, 5000)
        
    })

    socket.on("startGameRound$", () => { 
        
    })

    /**
     * need to impletement something to avoid server pressure on unlimited pick API call..
     */
    socket.on("selectACard$", (cardId: string) => { 
        var my_room = getMyRoom(socket.id);
        var current_round = my_room.rounds[my_room.rounds.length - 1];

        //Check its not the judge
        if (current_round.judge.socketId == socket.id) {
            console.error("selectACard$ | Judge cannot play this round!");
            return;
        }

         //Check duplicate selection
         var deplicate_pick = current_round.picks.find(x => { 
            if (x.socketId == socket.id) {
                return x;
            }
        })

        if (deplicate_pick !== null) {
            console.error("selectACard$ | Card has been picked");
            return;
        }

        //Set the status of this round to picking first...
        current_round.status = 'picking';

        var my_cards = returnPlayerCards(socket.id, my_room);
        var me = getMyDetail();
        var found_card = my_cards.find(x => {
            if (x.uniqueId == cardId) {
                return x;
            }
        });
       

        //Insert picked card into game round
        if (found_card !== null) {
            current_round.picks.push({
                socketId: socket.id,
                uniqueId: me.uniqueId,
                userName:me.userName,
                pickedCard:found_card
            })

            //broadcast to player a card has been picked and added to the round.
            socket.broadcast.to(my_room.uniqueId).emit("$cardPicked");

            //If the number of picks of the current round is equal to number of active player, it means the pick phase is completed.
            if (current_round.picks.length == my_room.activePlayerList.length) {
                
                setTimeout(() => { 
                    current_round.status = 'judging';
                    socket.broadcast.to(my_room.uniqueId).emit("$judgePicking");
                    var picks = [];
                    current_round.picks.forEach(x => { 
                        picks.push(x.pickedCard);
                    })
                    io.to(current_round.judge.socketId).emit('$cardsForRound', picks);
                }, 3000)
                
            } 

           
        }
    })

    socket.on("pickACard$", (cardId: string) => { 
        var my_room = getMyRoom(socket.id);
        var current_round = my_room.rounds[my_room.rounds.length - 1];
        //check player is the judge
        if (current_round.judge.socketId !== socket.id) {
            console.error("pickACard$ | You are not the judge!");
            return;
        }
        

        //check round status
        if (current_round.status !== 'judging') {
            console.error(roundStatusChecking(current_round.status));
            return;
        }

        let picked = current_round.picks.find(x => { 
            if (x.pickedCard.uniqueId == cardId) {
                return x;
            }
        })

        current_round.answer = picked.pickedCard;

        let winnerOfTheRound = findPlayerFromRoom(my_room, picked.uniqueId);
        winnerOfTheRound.score = winnerOfTheRound.score + 1;

        if (winnerOfTheRound.score == 10) {
            //annouce winner of the game..
            my_room.isFinished = true;
            socket.broadcast.to(my_room.uniqueId).emit("$gameOver", winnerOfTheRound);
        } else {
            roundOver(my_room);
        }
    })


    function createNewRoom(owner: Player,param:RoomInput) {
        var game_owner:GamePlayer = {
            ...owner,
            score: 0,
            currentDeck:[]
        }
        let room: Room = {
            name:param.name,
            uniqueId : uuidv4(),
            totalPlayer: param.totalPlayer,
            activePlayer: 1,
            activePlayerList: [game_owner],
            questions: [],
            usedQuestions:[],
            cards: [],
            usedCards:[],
            owner: owner,
            isStart: false,
            judge: null,
            rounds: [],
            isFinished:false
        }
        return room;
    }
    
    function getAvailableGameDTO() {
        let room_list_DTO = [];
        room_list.forEach(x => { 
            let dto:RoomDTO = {
                uniqueId: x.uniqueId,
                totalPlayer: x.totalPlayer,
                activePlayer: x.activePlayer,
                activePlayerList: [...x.activePlayerList],
                name:x.name
            }

            room_list_DTO.push(dto);
        })
        console.log(room_list_DTO);
        return room_list_DTO;
    }
    
    function getMyDetail() {
        return active_player_list.find(x => {if(x.socketId == socket.id) {
            return x
        }})
    }

    async function getMyDetailByUniqueId() {
        let user = await getHandshakeAuth()
        return active_player_list.find(x => {if(x.uniqueId == user.uniqueId) {
            return x
        }})
    }

   
    
    function startGame(roomId, socketId) {
    
        /**
         * Check room if it's available..
         * If the room is not available, return error
         * If the room is available, continue..
         * Check if it has  enough player
         */
    
        let room = room_list.find(x => { 
            if (x.owner.socketId == socketId && x.uniqueId == roomId) {
                return x;
            }
        })
    
        if (room.isStart === true) {
            console.error("startGame | game has been started...");
            return;
        }
    
        if (room == null) {
            console.error("startGame | cannot find this room to start the game");
            return;
        }

        if (room.activePlayerList.length < 6) {
            console.error("startGame | not enough player");
            return;
        }
    
        room.isStart = true;
        room.cards = [...cards];
        room.questions = [...questions];
    }
    
    function getRandomQuestion(room:Room):Question {
        let number = Math.random() * room.questions.length;
        
        return room.questions[number]
    }

    
    function assignPlayerCards(room: Room, numberofCards: number) {
        for (let playerIndex = 0; playerIndex < room.activePlayerList.length; playerIndex++){
            //get first 10 cards
            let cardsArray = [...room.activePlayerList[playerIndex].currentDeck];
            for (let x = 0; x < numberofCards; x++) {
                let number = Math.random() * room.cards.length;
                cardsArray.push(room.cards[number]);
                room.cards.splice(number, 1);
            }

            room.activePlayerList[playerIndex].currentDeck = cardsArray;
        }
    }
    
    function pickFirstJudge(room: Room) {
        /**
         * Randomly pick a judge from those 5 players for the first round.
         */
        let number = Math.random() * room.activePlayerList.length;
        let judge = room.activePlayerList[number];
        return judge;
    }
    
    function pickNextJudge(room: Room) {
        /**
         * Pick a judge based on next judge
         */
        let number = room.activePlayerList.findIndex(x => {
            x.uniqueId == room.judge.uniqueId
        });
        if (number < room.activePlayerList.length) {
            return room.activePlayerList[number + 1]
        } else {
            return room.activePlayerList[1]
        }
    }
    
    function roundOver(room: Room) {
        //remove current round question from question list
        var current_round = room.rounds[room.rounds.length - 1];
        var question = current_round.question;
        var index_question = room.questions.findIndex(x => {
            if (x.uniqueId == question.uniqueId) {
                return x;
            }
        });
        room.questions.splice(index_question, 1);

        //get random question for next round
        var question_next = getRandomQuestion(room);

        //get next judge
        var judge = pickNextJudge(room);
        //create new round.

        let next_round = {
            index: room.rounds.length + 1,
            question: question_next,
            picks: [],
            status: 'initiating',
            judge: { ...judge },
            answer: null
        };
        room.rounds.push(next_round)


        //Update everyone's card stack.
        assignPlayerCards(room, 1);

        current_round.status = 'completed';
        //refresh game data to player and start next round
        setTimeout(() => {
            //tell what are the picks and who is the winner of the round.
            let pickComplete: PickCompleteDTO = new PickCompleteDTO(current_round.picks, current_round.answer);
            console.log(pickComplete);
            socket.broadcast.to(room.uniqueId).emit("$pickComplete",pickComplete);
        }, 1000);

        //tell who is the next judge.
        setTimeout(() => { 
            $pickJudge(room,next_round.judge);
        }, 3000)
        
        //tell everyone's new card
        setTimeout(() => { 
            room.activePlayerList.forEach(x => { 
                if (socket.id == x.socketId) {
                    socket.emit("$newCards", x.currentDeck);
                }
            })

            
        }, 5000)
        
         //tell which is the next question and start the round.
         setTimeout(() => { 
            var question = getRandomQuestion(room);
             $currentQuestion(room, question);
             $startRound(room);
        }, 7000)
    }

    /**
     * 
     * @param socketId 
     * @param room 
     * 
     * Return the list of cards for a player 
     */
    function returnPlayerCards(socketId:string,room:Room) {
        let player = room.activePlayerList.find(x => { 
            if (x.socketId == socketId) {
                return x
            }
        })
    
        if (player == null) {
            console.error("returnPlayerCards | Cannot find the player");
            return;
        }
        return player.currentDeck;
    }
    
    async function joinRoom(roomId) {
    
        let socket_user = await getHandshakeAuth();
        /**
         * Check room if it is still existed..
         * If the room exists, continue
         * otherwise return the player to the room list and return error
         */
    
        let room = room_list.find(x => { 
            if (x.uniqueId == roomId) {
                return x;
            }
        })
    
        if (room == null) {
            console.error("joinRoom | Cannot find a game to join");
            return;
        }
    
      
        /**
         * check if the player is in the list...
         * If the player exists, continue
         * otherwise return the player to the main page and ask to enter a username
         */
        let me = active_player_list.find(x => { 
            if (x.uniqueId == socket_user.uniqueId) {
                return x;
            }
        })
    
        if (me == null) {
            console.error("joinRoom | Cannot find the player");
            return;
        }
    
        /**
         * check if this player is in the room...
         * if the player is already in the room, put him back into the room.
         * if the player is not in the room, then contirnue join the room.
         */
        let isInRoom = room.activePlayerList.find(x => { 
            if (x.uniqueId == socket_user.uniqueId) {
                return x;
            } 
        })
    
        if (isInRoom != null) {
            console.error("joinRoom | This player is already in the room");
        }
    
        /**
         * Check room if it's full,  max player number is game.totalNumber
         */

         if (room.activePlayerList.length >= room.totalPlayer) {
            console.error("joinRoom | The room is full");
            return;
        }

        /**
         * Check if room is started
         */

        if (room.isStart == true) {
            console.error("joinRoom | The room is started");
            return;
        }

        /**
         * Join the room and waiting..
         */
        var game_me:GamePlayer = {
            ...me,
            score: 0,
            currentDeck:[]
        }
        room.activePlayerList.push(game_me);

        return game_me;
    }
    
    function getMyRoom(userId:string) {
        // let myRoom = room_list.find(x => { 
        //     return x.activePlayerList.find(y => { 
        //         if (y.uniqueId == userId) {
        //             return x;
        //         }
        //     })
        // })
    
        // return myRoom;
        console.log('getMyRoom');
        for (let x = 0; x < room_list.length; x++){
            let room = room_list[x];
            for (let y = 0; y < room.activePlayerList.length; y++){
                let player = room.activePlayerList[y];
                if (player.uniqueId == userId) {
                    return room
                }
            }
        }
    }

    function roundStatusChecking(status: string) : string {
        return `roundStatusChecking | this round is ${status}`
    }

    function findPlayerFromRoom(room: Room, playerId: string) : GamePlayer {
        let player = room.activePlayerList.find(x => {
            if (x.uniqueId == playerId) {
                return x;
            }
        });

        return player;
    }


    /** all emit functions, all function start with $ as emit */
    function $pickJudge(room: Room, judge: Player) {
        let judgeDTO: PlayerDTO = {
            uniqueId: judge.uniqueId,
            userName: judge.userName
        }
        socket.broadcast.to(room.uniqueId).emit("$pickJudge", judgeDTO);
    }

    function $initCards(room:Room) {
        room.activePlayerList.forEach(x => { 
            if (x.socketId == socket.id) {
                socket.emit("$initCards",x.currentDeck)
            }
        })
    }

    function $currentQuestion(room:Room,first_question:Question) {
        socket.broadcast.to(room.uniqueId).emit("$currentQuestion", first_question);
    }

    function $startRound(room:Room) {
        socket.broadcast.to(room.uniqueId).emit("$startRound");
    }

    function $joinRoom(roomId:string,playerDTO:PlayerDTO) {
        socket.broadcast.to(roomId).emit("$joinRoom", playerDTO);
        $getRoomId(roomId)
    }
    

    function $errors(error: string, socketId: string) {
        if (socket.id == socketId) {
            socket.emit('$errors', error);
        }
        
    }

    async function $leaveRoom() {
        let socket_user = await getHandshakeAuth();
        console.info(`${socket_user.userName} has leaved the room`)
        socket.emit("$leaveRoom", socket_user);
    }

    function $ownerDisconnected(roomId) {
        console.info(`room ${roomId} is removed `)
        socket.to(roomId).emit("$ownerDisconnected", roomId);
    }

    function $getRoomId(roomId) {
        socket.emit("$getRoomId", roomId);
    }
    
    async function getHandshakeAuth(){
        let query_user =  JSON.parse(socket.handshake.query.user)
        console.log('getHandshakeAuth | ' + socket.handshake.query.user);
        if (query_user !== null) {
            let final_user: Player = { 
                uniqueId: query_user.uniqueId,
                socketId: socket.id,
                userName: query_user.userName
              }
              console.log('final 1| ');
            console.dir(final_user)
            
            let player = await active_player_list.find(x => { 
                if (x.uniqueId == final_user.uniqueId) {
                    return x;
                }
            })

            if (player) {
                return player;
            } else {
                active_player_list.push(final_user);
                return final_user;
            }
        }

        console.log('Nonget | ');
        return null;

    }

})




httpServer.listen(PORT, ():void => {
    console.log(`Server Running here 👉 http://localhost:${PORT}`);
});

app.post('/newuser', (req, res) => { 
    console.log('start new user');
    console.dir( req.body)
    let username = req.body.userName
    let player = InitiatePlayer(username);
    active_player_list.push(player);
    console.log(active_player_list);
    res.send(player);
})

app.post('/checkuser', (req, res) => { 
    console.log('start check user');
    console.dir(req.body)
    let player = active_player_list.find(x => { 
        if (x.uniqueId == req.body.uniqueId) {
            return x
        }
    });
    console.dir(player);
    if (player) {
        res.send(player);
    } else {
        res.send(null);
    }
})


function InitiatePlayer(userName: string) {
    //create a new player object with unqiue socketId and uniqueId
    let player: Player = {
        socketId: null,
        uniqueId: uuidv4(),
        userName: userName,
    }
    return player;
}


  




