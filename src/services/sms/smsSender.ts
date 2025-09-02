import axios from "axios";

interface IOTPSmsSender {
    to:number;
    from?:string;
    firstName:string;
    code:number;
}

interface ILoanAplicationSmsSender {
    to:number;
    from?:string;
    firstName:string;
    loanId:number;
    amount:number
}
const sendLoanApplicationSms = async ({to,firstName,from,amount,loanId}:ILoanAplicationSmsSender) => {
    const baseUrl=process.env.SMS_SENDER_PROVIDER || '';
    const apiKey=process.env.SMS_SENDER_APIKEY || '';
   try {
     const res = await axios.post(baseUrl, {
        "to": `234${to}`,
        "from": `${from??'Floath Hub'}`,
        "sms": `Hello ${firstName}, Loan Application Raised, Amount :N${amount} Loan ID ${loanId}. Date : ${Date.now}`,
        "type": "plain",
        "api_key": apiKey,
        "channel": "generic",
        // "media": {
        //     "url": "https://media.example.com/file",
        //     "caption": "your media file"
        // }
    })
    
   } catch (error) {
    console.log({seeError:error})
   }

}

const sendLoginOtp = async ({to,firstName,from,code}:IOTPSmsSender) => {
    const baseUrl=process.env.SMS_SENDER_PROVIDER || '';
    const apiKey=process.env.SMS_SENDER_APIKEY || '';
   try {
     const res = await axios.post(baseUrl, {
        "to": `234${to}`,
        "from": `${from??'Floath Hub'}`,
        "sms": `Hello ${firstName}, Your login Otp is ${code}. Expires in 10 min.`,
        "type": "plain",
        "api_key": apiKey,
        "channel": "generic",
        // "media": {
        //     "url": "https://media.example.com/file",
        //     "caption": "your media file"
        // }
    })
    
   } catch (error) {
    console.log({seeError:error})
   }

}

export { sendLoginOtp };