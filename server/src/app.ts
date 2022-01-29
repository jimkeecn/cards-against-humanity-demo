//npx ts-node src/foo.ts
import express = require("express");
import { isObject } from "util";
import { Room , PlayerDTO, Player, GamePlayer, PickCompleteDTO, Question, Card, RoomDTO } from './models/model';
const { v4: uuidv4 } = require('uuid');

const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

var room_list: Room[] = [];
var active_player_list: Player[] = [];
const questions = [];
const cards = [];

io.on('connection', (socket: any) => { 
    console.log("New player connected : " + socket);
    socket.on("createUserName$", (userName: string) => {
        active_player_list.push(InitiatePlayer(userName,socket.id))
    });

    socket.on("createNewRoom$", () => { 
        //check if I have room already
        let myRoom = getMyRoom(socket.id);

        if (myRoom != null) {
            console.error("This player has a room already");
            return;
        }

        //Find who is creating this game.
        let owner = active_player_list.find(x => { 
            if (x.socketId == socket.id) {
                return x;
            }
        });

        //If owner not existing, server error
        if (owner == null) {
            console.error("Cannot find owner from active player list");
            return;
        }

        //create the new room..
        let room = createNewRoom(owner);
        room_list.push(room);
        socket.join(room.uniqueId);
    })

    socket.on("refreshRoom$", () => { 
        socket.emit('$roomList', getAvailableGameDTO());
    })


    socket.on("joinRoom$", (roomId: string) => { 
        let player = joinRoom(roomId, socket.id);
        let playerDTO: PlayerDTO = {
            uniqueId: player.uniqueId,
            userName: player.userName
        }
        socket.join(roomId);
        $joinRoom(roomId, playerDTO);
    })

    socket.on("startGame$", () => { 
        var room = getMyRoom(socket.id);
        if (room == null) {
            console.error("Cannot find your room.");
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
            console.error("Judge cannot play this round!");
            return;
        }

         //Check duplicate selection
         var deplicate_pick = current_round.picks.find(x => { 
            if (x.socketId == socket.id) {
                return x;
            }
        })

        if (deplicate_pick !== null) {
            console.error("Card has been picked");
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
            console.error("You are not the judge!");
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
            socket.broadcast.to(my_room.uniqueId).emit("$gameOver", winnerOfTheRound);
        } else {
            roundOver(my_room);
        }
    })


    function createNewRoom(owner: Player) {
        var game_owner:GamePlayer = {
            ...owner,
            score: 0,
            currentDeck:[]
        }
        let room: Room = {
            uniqueId : uuidv4(),
            totalPlayer: 5,
            activePlayer: 1,
            activePlayerList: [game_owner],
            questions: [],
            usedQuestions:[],
            cards: [],
            usedCards:[],
            owner: owner,
            isStart: false,
            judge: null,
            rounds:[]
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
                activePlayerList: [...x.activePlayerList]
            }

            room_list_DTO.push(dto);
        })
        return room_list_DTO;
    }
    
    function getMyDetail() {
        return active_player_list.find(x => {if(x.socketId == socket.id) {
            return x
        }})
    }
    function InitiatePlayer(userName: string, socketId: string) {
        //create a new player object with unqiue socketId and uniqueId
        let player: Player = {
            socketId: socketId,
            uniqueId: uuidv4(),
            userName: userName,
        }
        return player;
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
            console.error("game has been started...");
            return;
        }
    
        if (room == null) {
            console.error("cannot find this room to start the game");
            return;
        }

        if (room.activePlayerList.length < 6) {
            console.error("not enough player");
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
            console.error("Cannot find the player");
            return;
        }
        return player.currentDeck;
    }
    
    function joinRoom(roomId, socketId) {
    
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
            console.error("Cannot find a game to join");
            return;
        }
    
        /**
         * check if the player is in the list...
         * If the player exists, continue
         * otherwise return the player to the main page and ask to enter a username
         */
        let me = active_player_list.find(x => { 
            if (x.socketId == socketId.id) {
                return x;
            }
        })
    
        if (me == null) {
            console.error("Cannot find the player");
            return;
        }
    
        /**
         * check if this player is in the room...
         * if the player is already in the room, put him back into the room.
         * if the player is not in the room, then contirnue join the room.
         */
        let isInRoom = room.activePlayerList.find(x => { 
            if (x.socketId == socketId) {
                return x;
            } 
        })
    
        if (isInRoom != null) {
            console.error("This player is already in the room");
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
    
    function getMyRoom(socketId:string) {
        let myRoom = room_list.find(x => { 
            x.activePlayerList.find(y => { 
                if (y.socketId == socketId) {
                    return x;
                }
            })
        })
    
        return myRoom;
    }

    function roundStatusChecking(status: string) : string {
        return `this round is ${status}`
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
    }
    

})


http.listen(4444);



