//添加socket
var socketio = require("socket.io") ;
var io;
var guestNumber = 1 ;
var nickNames = {} ;
var namesUsed = [] ;
var currentRoom = {} ;

exports.listen = function( server ){
    //启动socketio服务器 允许他搭载已有的http服务器上
    io = socketio.listen(server);
    io.set("log level" , 1);
    //定义每个用户链接的处理逻辑
    io.sockets.on("connection" , function( socket ) {
        //处理新用户连接
        guestNumber = assignGuestName(socket,guestNumber,nickNames,namesUsed);
        //在用户链接上来时吧他放入聊天室
        joinRoom(socket,"大神坑");
        //处理用户的消息，更名，以及聊天室的创建和变更
        handleMessageBroadcasting(socket,nickNames);
        handleNameChangeAttempts(socket,nickNames,namesUsed);
        handleRoomJoining(socket);
        //用户发出请求时，向其提供已被占用的聊天室的列表
        socket.on("room",function(){
            socket.emit("rooms" , io.sockets.manager.rooms)
        });
        //定义用户断开连接后的清楚逻辑
        handleClientDisconnection(socket,nickNames,namesUsed);
    })
}

/*
 * 分配用户昵称
 * 处理新用户的昵称，当用户第一次链接到服务器上时，
 * 用户会被放到一个叫lobby的聊天室中，并调用assignGuestName
 * 给他们分配一个默认昵称
 */
function assignGuestName( socket , guestNumber , nickNames , namesUsed ){
    //生成新昵称
    var name = "小白" + guestNumber + "号";
    //吧用户昵称跟客户端连接id关联上
    nickNames[socket.id] = name ;
    //让用户知道他们的昵称
    socket.emit("nameResult" , {
        success : true ,
        name : name
    })
    //存放已被占用的昵称
    console.log(name,namesUsed);
    namesUsed.push(name);
    //增加用来生成昵称的计数器
    return guestNumber + 1 ;
}


/*
 * 进入聊天室
 * 处理逻辑跟用户加入聊天室相关
 */
function joinRoom (socket , room){
    //让用户进入房间
    socket.join(room);
    //记录用户当前房间
    currentRoom[socket.id] = room;
    //让用户知道他们进入了新的房间
    socket.emit("joinResult",{room:room});
    //让房间里的其他用户知道有新用户进入了房间
    socket.broadcast.to(room).emit("message",{
        text:nickNames[socket.id] + "加入到了" + room + "."
    });
    //确定有哪些用户在这个房间里
    var usersInRoom = io.sockets.clients(room)
    //如果不止一个用户在这个房间里，汇总下都是谁
    if(usersInRoom.length > 1){
        var usersInRoomSummary = "目前已有的坑是 " + room + ": ";
        for(var index in usersInRoom){
            var userSocketId = usersInRoom[index].id
            if(userSocketId != socket.id){
                if(index > 0){
                    usersInRoomSummary += ", " ;
                }
                usersInRoomSummary += nickNames[userSocketId]
            }
        }
        usersInRoomSummary += ".";
        //将房间里其他用户汇总发送给这个用户
        socket.emit("message" , {text:usersInRoomSummary})
    }
}
/*
 * 更名请求处理逻辑
 * 用户不能将昵称改成以guest开头
 * 或改成其他已被占用的昵称
 */
function handleNameChangeAttempts( socket , nickNames , namesUsed ){
    //添加nameAttempt事件监听器
    socket.on("nameAttempt" , function( name ){
        //昵称不能以Guest开头
        if(name.indexOf("Guest") == 0){
            socket.emit("nameResult" , {
                success : false ,
                message : "Names cannot begin with \"Guest\"."
            });
        }else{
            //如果昵称还没注册就注册上
            if(namesUsed.indexOf(name) == -1){
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName);
                namesUsed.push(name);
                nickNames[socket.id] = name ;
                //删掉用户之前的昵称
                delete namesUsed[previousNameIndex];
                socket.emit("nameResult",{
                    success : true ,
                    name : name
                });
                socket.broadcast.to(currentRoom[socket.id]).emit("message" ,{
                    text : previousName + " is now known as " + name + "."
                });
            }else{
                //如果昵称已经被占用，给客户端发送错误消息
                socket.emit("nameResult",{
                    success:false ,
                    message : "That name is already in use."
                })
            }
        }
    });
}

//发生聊天消息
function handleMessageBroadcasting( socket ){
    socket.on("message" , function(message){
        socket.broadcast.to(message.room).emit("message",{
            text : nickNames[socket.id] + ": " + message.text
        })
    })
}

//创建房间
function handleRoomJoining(socket){
    socket.on("join",function( room ){
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket,room.newRoom);
    })
}


/*
 * 用户断开连接
 * 用户离开聊天程序时，从nickNames和nameUsed中移除用户的昵称
 */
function handleClientDisconnection(socket){
    socket.on("disconnect" , function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id])
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}
