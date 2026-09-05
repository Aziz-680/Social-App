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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
function App() {
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [message, setMessage] = (0, react_1.useState)('');
    const handleLogin = (e) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        e.preventDefault();
        try {
            // Calling YOUR Express backend!
            const response = yield axios_1.default.post('http://localhost:3000/api/auth/login', {
                email,
                password
            });
            // Save the token to local storage so we can use it for Friend Requests later
            localStorage.setItem('token', response.data.token);
            setMessage('✅ Login Successful!');
        }
        catch (error) {
            const err = error;
            setMessage('❌ Login Failed: ' + (((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Server error'));
        }
    });
    return (<div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Social App Test</h1>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        <button type="submit">Test Login</button>
      </form>

      {message && <p>{message}</p>}
    </div>);
}
exports.default = App;
