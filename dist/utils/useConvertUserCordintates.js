"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAddressGoogle = void 0;
const getUserAddressGoogle = (lat, lon) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const apiKey = process.env.GOOGLE_MAPS_KEY; // or from env
    const response = yield fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`);
    const data = yield response.json();
    console.log({ googleSaid: data });
    const address = (_a = data.results[0]) === null || _a === void 0 ? void 0 : _a.address_components.find((comp) => comp.types.includes("administrative_area_level_1"));
    return address === null || address === void 0 ? void 0 : address.long_name; // e.g., "Lagos State"
});
exports.getUserAddressGoogle = getUserAddressGoogle;
