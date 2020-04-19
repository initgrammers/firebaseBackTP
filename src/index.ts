import * as functions from 'firebase-functions';


const admin = require('firebase-admin'); 


admin.initializeApp();  

const db = admin.firestore();


export const addTickets = functions.https.onCall(async (data, context) => {

        let cooperativeRef = db.collection('cooperatives').doc(data.cooperativeId).collection('tickes').doc();
        let passengerRefGet = db.collection('passenger')
                                     .where('Card.id', '==', data.qrCode)
                                     .limit(1);
        let dataRx = {
            qrId: data.qrCode,
            idUnit: data.unitId,
            normalRate: data.normalPassenger,
            specialRate: data.specialPassenger,
            price: data.price,
            date: admin.firestore.Timestamp.now()
        }
        
        try {
            const snapshot = await passengerRefGet.get();
            const passengerDoc = snapshot.docs[0];
            const passengerId = passengerDoc.id;
                
            await db.runTransaction(async(t: any) => {
                    let passengerRef = db.collection('passenger').doc(passengerId).collection('tickets').doc();
                    await t.set(passengerRef, dataRx );
                    await t.set(cooperativeRef, dataRx);
                    });    
            return {type: 'success'};
        } catch (error) {
            return {type: 'error'};
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
