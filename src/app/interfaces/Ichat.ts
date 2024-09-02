export interface IPollOption {
    option: string;
  }
  
 export interface IPollData {
    question: string;
    options: IPollOption[];
  }
  


 export interface PollOption {
    option: string;
    votes: number;
  }
  
 export interface Poll {
    id: string;
    senderId: string;
    question: string;
    options: PollOption[];
    timestamp: Date;
  }


 
 