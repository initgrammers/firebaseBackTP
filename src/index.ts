import * as functions from 'firebase-functions';


const admin = require('firebase-admin'); 

import { v4 as uuidv4 } from 'uuid';

admin.initializeApp();  

const db = admin.firestore();


export const addTickets = functions.https.onCall(async (data, context) => {

        let cooperativeRef = db.collection('cooperatives').doc(data.cooperativeId).collection('tickes').doc();
        let passengerRefGet = db.collection('passenger')
                                     .where('Card.id', '==', data.qrCode)
                                     .limit(1);
        const route = [
                "Hacienda El Carmen",
                "Fundeporte",
                "Chillogallo",
                "Sta. Rita",
                "Mena Dos",
                "Biloxi",
                "La Santiago",
                "Alonso de angulo",
                "El Pintado",
                "La Magdalena",
                "La Mascota",
                "Dos Puentes",
                "San Diego",
                "San Roque",
        ];

        function between(min:any, max:any) {  
            return Math.floor(
              Math.random() * (max - min) + min
            )
        }
        let newBalance:any;
        let dataRx = {
            qrId: data.qrCode,
            idUnit: data.unitId,
            normalRate: data.normalPassenger,
            specialRate: data.specialPassenger,
            price: data.price,
            date: admin.firestore.Timestamp.now(),
            routeName: route[between(0,route.length)]
        }
        
        try {
            const snapshot = await passengerRefGet.get();
            const passengerDoc = snapshot.docs[0];
            const passengerId = passengerDoc.id;
            const passengerRef = db.collection('passenger').doc(passengerId).collection('tickets').doc();
            const passengerGet = await db.collection('passenger').doc(passengerId).get();
            const passenger = passengerGet.data();
            const passengerRefTicket = await db.collection('passenger').doc(passengerId);
              
            if ( passenger.Card.balance >= dataRx.price) {
                newBalance = (passenger.Card.balance - dataRx.price).toFixed(2);
                await db.runTransaction(async(t: any) => {
                        await t.set(passengerRef, dataRx );
                        await t.set(cooperativeRef, dataRx);
                        await t.update(passengerRefTicket, { "Card.balance": newBalance }) 
                    }); 
                    return {type: 'success'};
            } else {
                return {type: 'balanceError'};
            }
        } catch (error) {
            console.log(error);
            return {type: 'error'};
        }

 });


 exports.authenticationOnCreate = functions.auth.user().onCreate(async(user) => { 
       
        try {
               const { displayName,  email,  uid , photoURL, disabled } = user
               await  db.collection('passenger').doc(uid).set({
                    name: displayName,
                    email: email,
                    photoURL: photoURL,
                    disabled: disabled,
                    Card: {
                        id: uuidv4(),
                        createdAt: admin.firestore.Timestamp.now(),
                        balance: 10
                    }
               })
               console.log(user) 
               return {type: 'success'};
       } catch (error) {
           console.log(`${error}`);
            return `${error}este es el error`;
       }
 });







/*  return passengerRefGet
        .get()
        .then((snapshot: any) => {
            let passengerDoc = snapshot.docs[0];
            let passengerId = passengerDoc.id;
            return Promise.resolve(passengerId)
        }).then((passengerId: any) => {
            return db.runTransaction((t: any) => {
                let passengerRef = db.collection('passenger').doc(passengerId).collection('tickets').doc();
                t.set(passengerRef, dataRx );
                t.set(cooperativeRef, dataRx);
                })
        }).then(function() {
            return 'Exito';
        }).catch((error: any) => {
            return `Se ha producido un error ${error}`
        }); */
