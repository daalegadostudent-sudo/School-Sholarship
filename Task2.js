function evaluateSensorAlarm(sensors) {
    if (!Array.isArray(sensors) || sensors.length === 0) {
        return {
            alarmFired: false,
            ruleTriggered: "RULE_ERROR",
            explanation: "No sensor payload available for processing."
        };
    }

    const functionalSensors = [];
    const ignoredSensors = [];


    for (const sensor of sensors) {
        if (!sensor || typeof sensor !== 'object') continue;

        const { id, type, triggered, isFaulty, battery } = sensor;

        const isBatteryLow = typeof battery !== 'number' || battery < 10;
        const isSensorFaulty = isFaulty === true;
        const isValidType = ['motion', 'smoke', 'door', 'window'].includes(type);

        if (isSensorFaulty || isBatteryLow || !isValidType || typeof triggered !== 'boolean') {
            let reason = isSensorFaulty ? "Flagged as Faulty" : (isBatteryLow ? `Low Battery (${battery}%)` : "Invalid Sensor Format");
            ignoredSensors.push(`${id || 'Unknown'} [Reason: ${reason}]`);
        } else {
            functionalSensors.push(sensor);
        }
    }

    if (functionalSensors.length === 0) {
        return {
            alarmFired: false,
            ruleTriggered: "RULE_0_SYSTEM_FAULT",
            explanation: `All sensors are unreliable or offline. Ignored sensors: (${ignoredSensors.join(", ")}). Maintenance required.`
        };
    }


    const triggeredSmoke = functionalSensors.filter(s => s.type === 'smoke' && s.triggered);
    const triggeredSecurity = functionalSensors.filter(s => ['motion', 'door', 'window'].includes(s.type) && s.triggered);


    if (triggeredSmoke.length > 0) {
        const sensorIds = triggeredSmoke.map(s => s.id).join(", ");
        return {
            alarmFired: true,
            ruleTriggered: "RULE_1_CRITICAL_FIRE_ALARM",
            explanation: `CRITICAL FIRE THREAT: Smoke detected on active sensor(s): ${sensorIds}.`
        };
    }

    
    if (triggeredSecurity.length >= 2) {
        const details = triggeredSecurity.map(s => `${s.id} (${s.type})`).join(", ");
        return {
            alarmFired: true,
            ruleTriggered: "RULE_2_MULTI_SENSOR_SECURITY_BREACH",
            explanation: `SECURITY BREACH: Multiple perimeter triggers detected on: ${details}.`
        };
    }

    if (triggeredSecurity.length === 1) {
        const s = triggeredSecurity[0];
        return {
            alarmFired: false,
            ruleTriggered: "RULE_3_SINGLE_SENSOR_FALSE_ALARM_CANCELLATION",
            explanation: `ALARM CANCELLED: Isolated trigger on sensor ${s.id} (${s.type}) suppressed to prevent false alarm.`
        };
    }


    return {
        alarmFired: false,
        ruleTriggered: "RULE_4_ALL_CLEAR",
        explanation: "SYSTEM NORMAL: All functional sensors operating without active threat detections."
    };
}


const sampleSensors = [
    { id: "S-SMOKE-01", type: "smoke", triggered: false, isFaulty: false, battery: 95 },
    { id: "S-MOTION-01", type: "motion", triggered: true, isFaulty: false, battery: 85 },
    { id: "S-DOOR-01", type: "door", triggered: true, isFaulty: false, battery: 90 },
    { id: "S-WINDOW-01", type: "window", triggered: true, isFaulty: true, battery: 100 }, 
    { id: "S-MOTION-02", type: "motion", triggered: true, isFaulty: false, battery: 4 }    
];

console.log("--- SENSOR ALARM SYSTEM DECISION ---");
console.log(evaluateSensorAlarm(sampleSensors));
