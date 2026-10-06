//用户输入
function divEscapedContentElement( message ){
    return $("<div></div>").text(message);
}

//系统输入
function divSytemContentElement( message ){
    return $("<div></div>").html("<i>" + message + "</i>");
}

//处理原始的用户输入
function processUserInput ( chatApp , socket ){
    var message = $("#send-message").val();
    var systemMessage ;
    //如果用户输入的以内容"/"开头，将其作为聊天命令
    if(message.charAt(0) == "/"){
        systemMessage = chatApp.processCommand(message);
        if(systemMessage){
            $("#messages").append(divSytemContentElement(message));
        }
    }else{
        chatApp.sendMessage($("#room").text(),message);
        $("#messages").append(divEscapedContentElement(message));
        $("#messages").scrollTop($("#messages").prop("scrollHeight"));
    }
    $("#send-message").val("");
}

var socket = io.connect();
$(function(){
    var chatApp = new Chat( socket );
    //显示更名尝试的结果
    socket.on("nameResult",function(result){
        var message;
        if(result.success){
            message = "你目前的坑位名是： " + result.name + "." ;
        }else{
            message = result.message
        }
        $("#messages").append(divSytemContentElement(message));
    });
    //显示房间变换结果
    socket.on("joinResult" , function( result ){
        $("#room").text(result.room);
        $("#messages").append(divSytemContentElement("此坑位站不住了，已换到：" + result.room));
    });
    //显示接收到的消息
    socket.on("message",function( message ){
        var newElement = $("<div></div>").text(message.text);
        $("#messages").append(newElement);
    })
    //显示可用房间列表
    console.log(socket);
    socket.on("rooms",function(rooms){
        alert(1)
        $("#room-list").empty();
        for(var room in rooms){
            room = room.substring(1,room.length);
            if(room != ""){
                $("#room-list").append(divEscapedContentElement((room)))
            }
        }
        //点击更换房间
        $("#room-list div").click(function(){
            chatApp.processCommand("/join" + $(this).text());
            $("#send-message").focus();
        })
    })
    //定期请求可用房间列表
    setInterval((function(){
        socket.emit("rooms");
    }),1000);
    $("#send-message").focus();
    //提交表单可以发送聊天消息
    $("#send-form").submit(function(){
        processUserInput(chatApp,socket);
        return false;
    })
})