var express=require('express')
var app=express()
app.use(express.static('public'))
const port=process.env.PORT || 5000
var http=require('http').createServer(app);

var io=require('socket.io')(http);




http.listen(port)

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});





let userCount=0,;
//it like event emitter 
const myMap=new Map();

io.sockets.on('connection',(socket)=>{

 

    
    
    socket.emit('userId',socket.id)
  
      
    socket.on('create', function(nickName,socketId) {
        let room=Math.floor(Math.random() * 999)+99;
        myMap.set(room,{user1:`${socketId}`,user2:null,userCount:1})
       
       
  
        socket.emit('create',nickName,socketId,room,myMap.get(room).userCount) ;
       
    })
 

    socket.on('join', function(roomId,nickName,socketId) {
        let room=parseInt(roomId);
      
    if(myMap.has(room))
    {
      if(myMap.get(room).userCount!=2)
        {
         
        myMap.set(room,{user1:myMap.get(room).user1,user2:socketId,userCount:2})
       
    
        socket.emit('join',nickName,socketId,room,myMap.get(room).userCount) ;

        socket.broadcast.to(myMap.get(room).user1).emit('startEnable');
        socket.emit('startDisable');
       
     
    }
    else
    {  
      socket.emit('alertRoomFull',room);
    }

}
   else
    {
        socket.emit('alertNotFound',room);
    }
    
    })



    socket.on('startEnable',()=>{
        socket.emit('startEnable');
       
    })

    socket.on('startDisable',(room,currentUser)=>{
     
        if(myMap.get(room).user1==currentUser)
        {
            socket.broadcast.to(myMap.get(room).user2).emit('startDisable');
            }
            else if(myMap.get(room).user2==currentUser){
                socket.broadcast.to(myMap.get(room).user1).emit('startDisable');
            }
    })

  


socket.on('oponentVerify', (roomId,currentUserSocketId)=> {
    let room=parseInt(roomId)
    // console.log(myMap.get(room))

    if((myMap.get(room)!=undefined)&&(!isNaN(room))){
    //    console.log(`room ${room} usercount is ${userCount}`)
        
        if(myMap.get(room).user1!=null&&myMap.get(room).user2!=null) 
        {
            userCount=2; 
    
        }
        else if(myMap.get(room).user1!=null&&myMap.get(room).user2==null)
        {
            userCount=1;  
      
        }
        else
        {
            userCount=1;   
         
        }
        // socket.emit('oponentVerify',userCount);

        if(myMap.get(room).user1==currentUserSocketId){
        socket.emit('oponentVerify',userCount,true);
        socket.broadcast.to(myMap.get(room).user2).emit('oponentVerify',userCount,false);
        }
        else if(myMap.get(room).user2==currentUserSocketId){
            socket.emit('oponentVerify',userCount,false);
            socket.broadcast.to(myMap.get(room).user1).emit('oponentVerify',userCount,true);
        }
    
      
    }
 

 
})




socket.on('doorClose',(room,currentUserSocketId)=>{
    
 

      if(myMap.get(room).user1==currentUserSocketId){
         socket.broadcast.to(myMap.get(room).user2).emit('doorClose');
         socket.emit('doorClose');
         socket.emit('startEnable');
         socket.broadcast.to(myMap.get(room).user2).emit('startDisable');
      }
         else if(myMap.get(room).user2==currentUserSocketId){
         socket.broadcast.to(myMap.get(room).user1).emit('doorClose');
         socket.emit('doorClose');
         socket.broadcast.to(myMap.get(room).user1).emit('startEnable');
         socket.emit('startDisable');
         }




})

socket.on('doorOpen',(room,currentUserSocketId)=>{
    if(myMap.get(room).user1==currentUserSocketId){
        socket.broadcast.to(myMap.get(room).user2).emit('doorOpen');
        socket.emit('doorOpen');
     }

})
socket.on('start',(room)=>{
    socket.broadcast.to(myMap.get(room).user1).emit('start');
    
})

  
socket.on('boxRightWait', (room,userId)=> {  
  
    if(myMap.get(room).user1==userId){
    socket.emit('boxRightWait',true);
    }
    else{
    socket.emit('boxRightWait',false);
    }
})
socket.on('restart',(room,currentUser,restartType)=>{

socket.emit('restart',room,currentUser,restartType)
})
socket.on('disconnect', function() {
  
    for(const [key,value] of myMap){
        if(myMap.get(key).user1==socket.id)
        {
            myMap.set(key,{user1:myMap.get(key).user2,user2:null,userCount:1})
            
            socket.broadcast.to(myMap.get(key).user1).emit('boxRightWait',true);
            socket.broadcast.to(myMap.get(key).user1).emit('restart',key,socket.id,'normalRestart'); 
        }  
       
        if(myMap.get(key).user2==socket.id)
        {
            myMap.set(key,{user1:myMap.get(key).user1,user2:null,userCount:1})
            
            socket.broadcast.to(myMap.get(key).user1).emit('boxRightWait',true);
            socket.broadcast.to(myMap.get(key).user1).emit('restart',key,socket.id,'normalRestart'); 
        } 
        
    }
  });
  setInterval(function(){
    for(const [key,value] of myMap){
       
        if(myMap.get(key).user1==null&&myMap.get(key).user2==null)
        {      myMap.set(key,{user1:null,user2:null,userCount:0})
           myMap.delete(key)
       
        }
      }
  },100);

    socket.on("render",(O_zIndex,X_zIndex,index,room,toggle,currentUserSocketId)=>{
    
    
         socket.emit('render',O_zIndex,X_zIndex,index) 

         if(toggle=='x'){

         if(myMap.get(room).user1==currentUserSocketId)
         socket.broadcast.to(myMap.get(room).user2).emit('render',O_zIndex,X_zIndex,index);
         else if(myMap.get(room).user2==currentUserSocketId)
         socket.broadcast.to(myMap.get(room).user1).emit('render',O_zIndex,X_zIndex,index);
         }
         else if(toggle=='o'){
         if(myMap.get(room).user1==currentUserSocketId)
         socket.broadcast.to(myMap.get(room).user2).emit('render',O_zIndex,X_zIndex,index);
         else if(myMap.get(room).user2==currentUserSocketId)
         socket.broadcast.to(myMap.get(room).user1).emit('render',O_zIndex,X_zIndex,index);

         }

       

    })


    socket.on("enableCheckbox",(room,toggle,currentUserSocketId)=>{
        if(toggle=='x'){
        if(myMap.get(room).user1==currentUserSocketId)
        socket.broadcast.to(myMap.get(room).user2).emit('enableCheckbox')
        else if(myMap.get(room).user2==currentUserSocketId)
        socket.broadcast.to(myMap.get(room).user1).emit('enableCheckbox')
        }
        else if(toggle=='o'){
            if(myMap.get(room).user1==currentUserSocketId)
            socket.broadcast.to(myMap.get(room).user2).emit('enableCheckbox')
            else if(myMap.get(room).user2==currentUserSocketId)
            socket.broadcast.to(myMap.get(room).user1).emit('enableCheckbox')
        }
    })

    
    socket.on("disableCheckbox",()=>{
        socket.emit('disableCheckbox')
    })
  
    socket.on("onTimer",(value,room,currentUserSocketId)=>{
     

        if(value=='x'){
            if(myMap.get(room).user1==currentUserSocketId)
            socket.broadcast.to(myMap.get(room).user2).emit('onTimer',value)
            else if(myMap.get(room).user2==currentUserSocketId)
            socket.broadcast.to(myMap.get(room).user1).emit('onTimer',value)
            }
            else if(value=='o'){
                if(myMap.get(room).user1==currentUserSocketId)
                socket.broadcast.to(myMap.get(room).user2).emit('onTimer',value)
                else if(myMap.get(room).user2==currentUserSocketId)
                socket.broadcast.to(myMap.get(room).user1).emit('onTimer',value)
            }



    })

    socket.on("offTimer",()=>{
        socket.emit('offTimer')
    })

    socket.on("sendWhiteFlag",(room,currentUserSocketId)=>{
        if(myMap.get(room).user1==currentUserSocketId)
        socket.broadcast.to(myMap.get(room).user2).emit('sendWhiteFlag')
        else if(myMap.get(room).user2==currentUserSocketId)
        socket.broadcast.to(myMap.get(room).user1).emit('sendWhiteFlag')
    })

   
socket.on('roundCount',(room,currentUserSocketId,rc)=>{
    if(myMap.get(room).user1==currentUserSocketId){
    socket.emit('roundCount',rc)
    socket.broadcast.to(myMap.get(room).user2).emit('roundCount',rc)
    }
    else if(myMap.get(room).user2==currentUserSocketId)
    {
    socket.emit('roundCount',rc)
    socket.broadcast.to(myMap.get(room).user1).emit('roundCount',rc)
    }
})


socket.on('restartFontSize',(room,currentUser)=>{
   
    if(myMap.get(room).user1==currentUser)
    {
        socket.broadcast.to(myMap.get(room).user2).emit('restartFontSize');
        socket.emit('restartFontSize');
        }
        else if(myMap.get(room).user2==currentUser){
            socket.broadcast.to(myMap.get(room).user1).emit('restartFontSize');
            socket.emit('restartFontSize');
        }
})
socket.on('opponentName',(room,currentUser,playerType,opponentName)=>{
if(playerType=='admin')
{
    socket.broadcast.to(myMap.get(room).user2).emit('opponentName',opponentName);
}
else if(playerType=='player'){
    socket.broadcast.to(myMap.get(room).user1).emit('opponentName',opponentName);
}
})

socket.on('restartStartEnable',(userType,room,currentUser)=>{
   if(userType=='self'){
    socket.emit('restartStartEnable');
    }
    else if(userType=='opponent'){
        if(myMap.get(room).user1==currentUser)
        {
            socket.broadcast.to(myMap.get(room).user2).emit('restartStartEnable');
            
            }
            else if(myMap.get(room).user2==currentUser){
                socket.broadcast.to(myMap.get(room).user1).emit('restartStartEnable');
                
            }
    }
})


socket.on('restartStartDisable',(userType,room,currentUser)=>{
    if(userType=='self'){
     socket.emit('restartStartDisable');
     }
     else if(userType=='opponent'){
         if(myMap.get(room).user1==currentUser)
         {
             socket.broadcast.to(myMap.get(room).user2).emit('restartStartDisable');
             
             }
             else if(myMap.get(room).user2==currentUser){
                 socket.broadcast.to(myMap.get(room).user1).emit('restartStartDisable');
                 
             }
     }
 })



 socket.on('winnerFlag',(room,currentUser)=>{
    socket.emit('winnerFlag',room,currentUser);
 }) 

 socket.on('loserFlag',(room,currentUser)=>{
 
    if(myMap.get(room).user1==currentUser)
         {
             socket.broadcast.to(myMap.get(room).user2).emit('loserFlag');
             
             }
             else if(myMap.get(room).user2==currentUser){
                 socket.broadcast.to(myMap.get(room).user1).emit('loserFlag');
                 
             }
    })



    socket.on('drawFlag',(room,currentUser)=>{
        socket.emit('disableCheckbox')
        if(myMap.get(room).user1==currentUser)
        { 
            socket.broadcast.to(myMap.get(room).user2).emit('drawFlag',room,currentUser);
            socket.emit('drawFlag',room,currentUser);
            }
            else if(myMap.get(room).user2==currentUser){
               
                socket.broadcast.to(myMap.get(room).user1).emit('drawFlag',room,currentUser);
                socket.emit('drawFlag',room,currentUser);
            }
   
           
    })



    socket.on('roundCountVerify',(room,currentUser,roundCount)=>{

if((myMap.get(room)!=undefined)&&(!isNaN(room))){
        if(myMap.get(room).user1!=null&&myMap.get(room).user2!=null) 
        {
        if(myMap.get(room).user1==currentUser)
        { 
            socket.broadcast.to(myMap.get(room).user2).emit('roundCountVerify',roundCount);
        }
        }
    
    }
    })



    
})
  




