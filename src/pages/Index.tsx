
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, QrCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MenuSelectionRoom from '@/components/MenuSelectionRoom';

const Index = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = () => {
    if (!userName.trim()) {
      toast({
        title: "이름을 입력해주세요",
        description: "방을 만들기 위해서는 이름이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    const newRoomId = generateRoomId();
    setCurrentRoom(newRoomId);
    
    toast({
      title: "방이 생성되었습니다!",
      description: `방 코드: ${newRoomId}`,
    });
  };

  const joinRoom = () => {
    if (!userName.trim()) {
      toast({
        title: "이름을 입력해주세요",
        description: "방에 참여하기 위해서는 이름이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    if (!roomId.trim()) {
      toast({
        title: "방 코드를 입력해주세요",
        description: "참여할 방의 코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setCurrentRoom(roomId.toUpperCase());
    
    toast({
      title: "방에 참여했습니다!",
      description: `방 코드: ${roomId.toUpperCase()}`,
    });
  };

  const shareRoom = () => {
    const url = `${window.location.origin}?room=${currentRoom}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "링크가 복사되었습니다!",
      description: "팀원들에게 공유해보세요.",
    });
  };

  if (currentRoom) {
    return (
      <MenuSelectionRoom 
        roomId={currentRoom} 
        userName={userName}
        onLeaveRoom={() => setCurrentRoom(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">🍽️ 지땅음</h1>
          <p className="text-lg text-gray-600 font-medium">지금 땅기는 음식!</p>
          <p className="text-sm text-gray-500 mt-2">팀원들과 함께 메뉴를 빠르게 결정해보세요</p>
        </div>

        {/* User Name Input */}
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-center text-gray-800">시작하기</CardTitle>
            <CardDescription className="text-center">
              먼저 당신의 이름을 알려주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userName" className="text-sm font-medium text-gray-700">
                이름
              </Label>
              <Input
                id="userName"
                placeholder="이름을 입력하세요"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="mt-1 bg-white border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="space-y-4">
          <Card className="shadow-lg border border-orange-200 bg-gradient-to-r from-orange-500 to-red-500 text-white cursor-pointer hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105" onClick={createRoom}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">새 방 만들기</h3>
                  <p className="text-orange-100 text-sm">메뉴 선택 방을 생성하고 팀원들을 초대하세요</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                <Users className="h-5 w-5" />
                <span>방 참여하기</span>
              </CardTitle>
              <CardDescription>
                팀원이 만든 방에 참여해보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roomId" className="text-sm font-medium text-gray-700">
                  방 코드
                </Label>
                <Input
                  id="roomId"
                  placeholder="방 코드를 입력하세요 (예: ABC123)"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="mt-1 bg-white border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>
              <Button 
                onClick={joinRoom}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                방 참여하기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="shadow-lg border border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-center text-sm text-blue-700 space-y-1">
              <p className="font-medium">💡 사용법</p>
              <p>1. 방을 만들거나 참여하세요</p>
              <p>2. 음식을 드래그해서 선호도를 표시하세요</p>
              <p>3. 모두가 완료하면 최적의 메뉴를 확인하세요!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
