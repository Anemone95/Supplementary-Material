module.exports = function () {
    return  {

        ___functionTemplateKeys___: {
            modname: "JRq5j16TD__module_name__rB2N37y9eevXq",
            funcname: "JRqjew1TD__function_name__rB2N37y9vXq",
            url: "Io0hN2Zva__url__zBhktSE3QQCRYjreWi7rb",
            sourcefile: "Io0hN2Zva__sourcefile__zBQQCRrYjWi7rb",
            nodefile: "Io0hN2Zva__nodefile__zBQQCRYjrerWi7rb",
            browserfile: "Io0hN2Zva__browserfile__zBQQCRYjWi7rb",
            firstHandler: "S3dfeKeUO__FirstHandler__ZjDPbx9dHRLB",
            nextHandler: "S3ereKeUO__NextHandler__ZjDPbx9deHRLB",
            argschecker: "\\\"Io0hN2Zva__arguments__zBQQCRYjWi7rb\\\"",
            setupCode: "send\\(\\\"7xdvLqBy__setupCode__9QyqmhWB5Fz0\\\"\\,nextHandler\\)\\;",
            handlerCode: "send\\(\\\"S3KeUO__HandlerCode__ZjDPbx9dHRLB\\\"\\,nextHandler\\)\\;",
            followUpCode: ",next:\\\"S3KeUO__FollowUpCode__ZjDPbx9dHRLB\\\"",
            serverCode: "send\\(\\\"S3KeUO__HandlerCode__ZjDPbx9dHRLB\\\"\\)\\;",
            browserCode: "\\{src\\:\\\"S3KeUO__HandlerCode__ZjDPbx9dHRLB\\\"\\}"
        },


        ___followupTemplate___: function S3dfeKeUO__FirstHandler__ZjDPbx9dHRLB(response) {
            nextHandler = "S3ereKeUO__NextHandler__ZjDPbx9deHRLB";
            send("S3KeUO__HandlerCode__ZjDPbx9dHRLB",nextHandler);
        },


        ___browserTemplate___: function JRqjew1TD__function_name__rB2N37y9vXq() {

            var module_info = {
                url: "Io0hN2Zva__url__zBhktSE3QQCRYjreWi7rb",
                modname: "JRq5j16TD__module_name__rB2N37y9eevXq",
                args: "Io0hN2Zva__arguments__zBQQCRYjWi7rb"
            };

            module.exports = function JRqjew1TD__function_name__rB2N37y9vXq(args) {
                var nextHandler = "S3dfeKeUO__FirstHandler__ZjDPbx9dHRLB";


                var send = function JRqjew1TD__function_name__rB2N37y9vXq_sendProc(payload, id) {

                    var jpacket = {
                        JRq5j16TD__module_name__rB2N37y9eevXq: {
                            JRqjew1TD__function_name__rB2N37y9vXq: {
                            }
                        }
                    };
                    jpacket.JRq5j16TD__module_name__rB2N37y9eevXq.JRqjew1TD__function_name__rB2N37y9vXq[nextHandler] = { args: payload, id: id || nextHandler };
                    modules.REQUIRE.local.getScriptSource(
                        module_info.url,
                        {
                            method: "POST",
                            content: JSON.stringify(jpacket)
                        },
                        function (responseJSON) {

                            var followUpHandlers = {
                                S3dfeKeUO__FirstHandler__ZjDPbx9dHRLB: function S3dfeKeUO__FirstHandler__ZjDPbx9dHRLB(response) {
                                    nextHandler = "S3ereKeUO__NextHandler__ZjDPbx9deHRLB";
                                    send("S3KeUO__HandlerCode__ZjDPbx9dHRLB",nextHandler);
                                },next:"S3KeUO__FollowUpCode__ZjDPbx9dHRLB"
                            };
                            var pkt = JSON.parse(responseJSON);
                            if (pkt) {
                                console.log(JSON.stringify(pkt));
                                var incoming = pkt.responses[0];
                                followUpHandlers[incoming.id || nextHandler](incoming.response);
                            } else {
                                errorHandler({error: "badly formed json"}, null);
                            }
                        });
                };
                send("7xdvLqBy__setupCode__9QyqmhWB5Fz0",nextHandler);
            }

        },

        ___nodeTemplate___: function JRqjew1TD__function_name__rB2N37y9vXq() {
            // node file JRqjew1TD__function_name__rB2N37y9vXq.js begins here
            /*****************************************************************/
            /* This is node.js only code. Do not remove or edit this header  */
            eval(require('requireasync').install);
            /* The above code loads appropriate code for this module         */
            /*****************************************************************/

            var module_info = {
                url: "Io0hN2Zva__url__zBhktSE3QQCRYjreWi7rb",
                modname: "JRq5j16TD__module_name__rB2N37y9eevXq",
                sourcefile: "Io0hN2Zva__sourcefile__zBQQCRrYjWi7rb",
                nodefile: "Io0hN2Zva__nodefile__zBQQCRYjrerWi7rb",
                browserfile: "Io0hN2Zva__browserfile__zBQQCRYjWi7rb",
                args: "Io0hN2Zva__arguments__zBQQCRYjWi7rb",
                ugly: {src:"S3KeUO__HandlerCode__ZjDPbx9dHRLB"}
            };

            var nextHandler = "S3ereKeUO__NextHandler__ZjDPbx9deHRLB";

            module.exports = function (label, args, payload, send) {
                var postHandlers = {
                    S3dfeKeUO__FirstHandler__ZjDPbx9dHRLB: function S3dfeKeUO__FirstHandler__ZjDPbx9dHRLB() {
                        send("S3KeUO__HandlerCode__ZjDPbx9dHRLB",nextHandler);
                    },next:"S3KeUO__FollowUpCode__ZjDPbx9dHRLB"
                };
                postHandlers[label](payload);
            };

            module.exports.information = function () {
                return module_info;
            };

            // node file JRqjew1TD__function_name__rB2N37y9vXq.js ends here
        }

    }
}