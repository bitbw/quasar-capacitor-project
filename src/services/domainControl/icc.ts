export const NOTIFY = {
  name: "notify",
  uuid: 0x6601,
  properties: ["read", "write", "notify"],
};
export const WIRE_CONTROL = {
  name: "wireControl",
  uuid: 0x6602,
  properties: ["read", "write", "notify"],
};
export const LINE_CONTROL_STEERING = {
  name: "lineControlSteering",
  uuid: 0x6603,
  properties: ["read", "write", "notify"],
};
export const REAR_WHEEL_STEERING = {
  name: "rearWheelSteering",
  uuid: 0x6604,
  properties: ["read", "write", "notify"],
};
export const ACTIVE_SUSPENSION = {
  name: "activeSuspension",
  uuid: 0x6605,
  properties: ["read", "write", "notify"],
};
export const TORQUE_DISTRIBUTION = {
  name: "torqueDistribution",
  uuid: 0x6606,
  properties: ["read", "write", "notify"],
};
export const STABILITY = {
  name: "stability",
  uuid: 0x6607,
  properties: ["read", "write", "notify"],
};
export const STEADY_STATE_CHARACTERISTIC = {
  name: "steadyStateCharacteristic",
  uuid: 0x6608,
  properties: ["read", "write", "notify"],
};
export const YAW_RESPONSE = {
  name: "yawResponse",
  uuid: 0x6609,
  properties: ["read", "write", "notify"],
};
export const REST = {
  name: "rest",
  uuid: 0x660a,
  properties: ["read", "write", "notify"],
};
export const ICC_SERVICE = {
  name: "ICC",
  uuid: 0x2024,
  characteristics: [
    NOTIFY,
    WIRE_CONTROL,
    LINE_CONTROL_STEERING,
    REAR_WHEEL_STEERING,
    ACTIVE_SUSPENSION,
    TORQUE_DISTRIBUTION,
    STABILITY,
    STEADY_STATE_CHARACTERISTIC,
    YAW_RESPONSE,
    REST,
  ],
};
