window.FirebaseService=(()=>{
  let db=null;
  let auth=null;

  function init(){
    if(!window.firebase||!window.WATER_CONFIG?.firebase) return false;
    if(!firebase.apps.length) firebase.initializeApp(window.WATER_CONFIG.firebase);
    db=firebase.firestore();
    auth=firebase.auth();
    return true;
  }

  function onAuth(callback){
    if(!auth) init();
    return auth.onAuthStateChanged(callback);
  }

  async function signIn(email,password){
    if(!auth) init();
    return auth.signInWithEmailAndPassword(email,password);
  }

  async function signOut(){
    if(!auth) init();
    return auth.signOut();
  }

  function listenReports(callback){
    if(!db) init();
    return db.collection('reports').orderBy('reportDate','desc').onSnapshot(snapshot=>{
      callback(snapshot.docs.map(doc=>({id:doc.id,...doc.data()})));
    });
  }

  function listenFuelEntries(callback){
    if(!db) init();
    return db.collection('fuelEntries').orderBy('date','desc').onSnapshot(snapshot=>{
      callback(snapshot.docs.map(doc=>({id:doc.id,...doc.data()})));
    });
  }

  async function addFuelEntry(data){
    if(!db) init();
    return db.collection('fuelEntries').add({...data,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  }

  async function saveReport(data,id){
    if(!db) init();
    if(id) return db.collection('reports').doc(id).set({...data,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    return db.collection('reports').add({...data,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  }

  return {init,onAuth,signIn,signOut,listenReports,listenFuelEntries,addFuelEntry,saveReport};
})();
