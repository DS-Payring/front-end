import Signup from "./pages/User/SignUp";
import Login from "./pages/User/Login";
import EditPage from "./pages/UserInfo/Editpage";
import Invite from "./pages/UserInfo/Invite";
import MyPage from "./pages/UserInfo/Mypage";
import PaymentStatus from "./pages/PaymentStatus";
import TransferRecieve from "./pages/TransferG/TransferRecive";
import Transfer from "./pages/TransferG/Transfer";
import TransferSend from "./pages/TransferG/TransferSend";
import MainPage from "./pages/Main/MainPage";
import CreateRoom from "./pages/Room/CreateRoom";
import RoomDetail from "./pages/Room/RoomDetail";
import MoneyRecord from "./pages/Money/MoneyRecord";
import MoneyRecordDetail from "./pages/Money/MoneyRecordDetail";
import StartSettlement from "./pages/Room/StartSettlement";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import './App.css';

function App() {
  return (
    <Router className="App">
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/signup" element={<Signup />} /> 

        <Route path="/main" element={<MainPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/edit" element={<EditPage />} />
        <Route path="/invite" element={<Invite />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route path="/transfer/:roomId" element={<Transfer />} />
        <Route path="/transfer-receive/:roomId" element={<TransferRecieve />} />
        <Route path="/transfer-send/:roomId" element={<TransferSend />} />

        <Route path="/create-room" element={<CreateRoom/>} />
        <Route path="/room-detail/:id" element={<RoomDetail />} />
        <Route path="/money-record/:id" element={<MoneyRecord />} />
        <Route path="/money-record-detail/:paymentId" element={<MoneyRecordDetail />} />
        <Route path="/start-settlement/:roomId" element={<StartSettlement />} />
      </Routes>
    </Router>
  );
}

export default App;