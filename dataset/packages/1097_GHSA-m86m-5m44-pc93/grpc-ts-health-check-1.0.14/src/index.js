"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grpc_boom_1 = __importDefault(require("grpc-boom"));
const health_grpc_pb_1 = require("./proto/health_grpc_pb");
exports.HealthClient = health_grpc_pb_1.HealthClient;
exports.HealthService = health_grpc_pb_1.HealthService;
const health_pb_1 = require("./proto/health_pb");
exports.HealthCheckRequest = health_pb_1.HealthCheckRequest;
exports.HealthCheckResponse = health_pb_1.HealthCheckResponse;
class GrpcHealthCheck {
    constructor(statusMap) {
        this.statusMap = statusMap;
    }
    setStatus(service, status) {
        this.statusMap[service] = status;
    }
    check(call, callback) {
        const service = call.request.getService();
        const status = this.statusMap[service];
        if (!status) {
            callback(grpc_boom_1.default.notFound(`Status not found for service: ${service}`), null);
        }
        else {
            const response = new health_pb_1.HealthCheckResponse();
            response.setStatus(status);
            callback(null, response);
        }
    }
}
exports.GrpcHealthCheck = GrpcHealthCheck;
