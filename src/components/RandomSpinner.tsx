
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  emoji: string;
}

interface RandomSpinnerProps {
  menus: MenuItem[];
  onResult: (selectedMenu: MenuItem) => void;
  onClose: () => void;
}

const RandomSpinner: React.FC<RandomSpinnerProps> = ({ menus, onResult, onClose }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

  const startSpin = () => {
    if (menus.length === 0) return;
    
    setIsSpinning(true);
    setSelectedMenu(null);
    
    let spins = 0;
    const maxSpins = 20 + Math.floor(Math.random() * 20); // 20-40번 돌림
    
    const spinInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % menus.length);
      spins++;
      
      if (spins >= maxSpins) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        const finalMenu = menus[currentIndex];
        setSelectedMenu(finalMenu);
        
        setTimeout(() => {
          onResult(finalMenu);
        }, 1500);
      }
    }, 100);
  };

  useEffect(() => {
    // 컴포넌트가 마운트되면 자동으로 스핀 시작
    startSpin();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm bg-white shadow-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">🎲 랜덤 선택</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center space-y-6">
            {/* Spinner */}
            <div className={`w-32 h-32 mx-auto rounded-full border-8 border-orange-200 bg-white flex items-center justify-center shadow-lg transition-all duration-100 ${
              isSpinning ? 'animate-spin' : selectedMenu ? 'scale-110 border-green-400' : ''
            }`}>
              <div className="text-center">
                <div className="text-4xl mb-1">
                  {menus.length > 0 ? menus[currentIndex]?.emoji : '🍽️'}
                </div>
                <div className="text-xs font-medium text-gray-700">
                  {menus.length > 0 ? menus[currentIndex]?.name : ''}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              {isSpinning && (
                <p className="text-sm text-gray-600 animate-pulse">
                  돌리는 중...
                </p>
              )}
              
              {selectedMenu && (
                <div className="space-y-3">
                  <p className="text-lg font-bold text-green-600">
                    🎉 결정되었습니다!
                  </p>
                  <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                    <div className="text-3xl mb-2">{selectedMenu.emoji}</div>
                    <div className="font-bold text-lg text-gray-800">{selectedMenu.name}</div>
                    <div className="text-sm text-gray-600">{selectedMenu.category}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {!isSpinning && !selectedMenu && (
                <Button 
                  onClick={startSpin}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  다시 돌리기
                </Button>
              )}
              
              {selectedMenu && (
                <Button 
                  onClick={() => onResult(selectedMenu)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  확인
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RandomSpinner;
