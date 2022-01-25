export class Room {
    
    uniqueId: string;
    totalPlayer: number;
    activePlayer: number;
    activePlayerList: GamePlayer[]; //Player Object Array
    questions: Question[]; //Questions List
    usedQuestions: Question[] //Questions has been used
    cards: Card[]; //Cards List
    usedCards: Card[]; //Cards has been used
    owner: Player;
    isStart: boolean;
    judge: Player;
    rounds:Round[]
}

export class RoomDTO {
    uniqueId: string;
    totalPlayer: number;
    activePlayer: number;
    activePlayerList: GamePlayer[];
}

export class Player {
    socketId: string;
    uniqueId: string;
    userName: string;
}

export class GamePlayer{
    socketId: string;
    uniqueId: string;
    userName: string;
    score: number;
    currentDeck: Card[]; //Cards Deck, no more than 10
}

export class PlayerDTO {
    uniqueId: string;
    userName: string;
}

export class Round{
    judge: Player;
    index: number; //index starting with 1
    question: Question;
    picks: PlayerPick[];
    status: string; //initiating,picking,judging,completed
    answer: Card;
}

export class PlayerPick{
    socketId: string;
    uniqueId: string;
    userName: string;
    pickedCard: Card;
}

export class PlayerPickDTO{
    userName: string;
    pickedCard: Card;
}

export class Card{
    uniqueId: string;
    content: string;
    description: string;
}

export class Question{
    uniqueId: string;
    content: string;
    description: string;
}

export class PickCompleteDTO{
    picks: PlayerPickDTO[];
    answer: Card;

    constructor(picksDB:PlayerPick[], answerDB:Card) {
        this.picks = [];
        picksDB.forEach(x => { 
            this.picks.push({
                userName: x.userName,
                pickedCard:x.pickedCard
            })
        })

        this.answer = answerDB;
    }
}