
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Heart, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  emoji: string;
  isCustom?: boolean;
}

interface SituationPreference {
  situation: string;
  liked: string[];
  disliked: string[];
  customMenus: MenuItem[];
}

interface PreferencesManagerProps {
  onClose: () => void;
}

const PreferencesManager: React.FC<PreferencesManagerProps> = ({ onClose }) => {
  const [selectedSituation, setSelectedSituation] = useState('점심시간');
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('한식');
  const [newMenuEmoji, setNewMenuEmoji] = useState('🍽️');

  const situations = ['점심시간', '저녁시간', '술자리', '회식', '데이트'];
  const categories = ['한식', '일식', '양식', '중식', '기타'];

  // Mock data - in real app, this would come from localStorage or backend
  const [preferences, setPreferences] = useState<SituationPreference[]>([
    {
      situation: '점심시간',
      liked: [],
      disliked: [],
      customMenus: []
    }
  ]);

  const currentPreference = preferences.find(p => p.situation === selectedSituation) || {
    situation: selectedSituation,
    liked: [],
    disliked: [],
    customMenus: []
  };

  const addCustomMenu = () => {
    if (!newMenuName.trim()) {
      toast({
        title: "메뉴 이름을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    const newMenu: MenuItem = {
      id: `custom_${Date.now()}`,
      name: newMenuName,
      category: newMenuCategory,
      emoji: newMenuEmoji,
      isCustom: true
    };

    setPreferences(prev => prev.map(p => 
      p.situation === selectedSituation
        ? { ...p, customMenus: [...p.customMenus, newMenu] }
        : p
    ));

    setNewMenuName('');
    setNewMenuEmoji('🍽️');

    toast({
      title: "메뉴가 추가되었습니다!",
      description: `${newMenuName}이(가) ${selectedSituation} 취향에 추가되었습니다.`,
    });
  };

  const removeCustomMenu = (menuId: string) => {
    setPreferences(prev => prev.map(p => 
      p.situation === selectedSituation
        ? { ...p, customMenus: p.customMenus.filter(m => m.id !== menuId) }
        : p
    ));

    toast({
      title: "메뉴가 삭제되었습니다",
    });
  };

  const savePreferences = () => {
    // In real app, save to localStorage or backend
    localStorage.setItem('mealPreferences', JSON.stringify(preferences));
    
    toast({
      title: "취향이 저장되었습니다!",
      description: `${selectedSituation} 설정이 저장되었습니다.`,
    });
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-orange-600">🎯 내 취향 설정</h1>
          <Button 
            onClick={onClose}
            variant="outline" 
            size="sm"
            className="border-gray-200"
          >
            닫기
          </Button>
        </div>

        {/* Situation Selection */}
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-800">상황 선택</CardTitle>
            <CardDescription>
              어떤 상황의 취향을 설정하시겠어요?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedSituation} onValueChange={setSelectedSituation}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {situations.map(situation => (
                  <SelectItem key={situation} value={situation}>
                    {situation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Custom Menu Addition */}
        <Card className="shadow-lg border border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>나만의 메뉴 추가</span>
            </CardTitle>
            <CardDescription>
              원하는 메뉴를 직접 추가해보세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="menuName">메뉴 이름</Label>
                <Input
                  id="menuName"
                  placeholder="예: 떡볶이"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="menuEmoji">이모지</Label>
                <Input
                  id="menuEmoji"
                  placeholder="🍽️"
                  value={newMenuEmoji}
                  onChange={(e) => setNewMenuEmoji(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="menuCategory">카테고리</Label>
              <Select value={newMenuCategory} onValueChange={setNewMenuCategory}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={addCustomMenu}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              메뉴 추가하기
            </Button>
          </CardContent>
        </Card>

        {/* Custom Menus List */}
        {currentPreference.customMenus.length > 0 && (
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-gray-800">
                {selectedSituation} - 나만의 메뉴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentPreference.customMenus.map((menu) => (
                  <div key={menu.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{menu.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-800">{menu.name}</p>
                        <p className="text-sm text-gray-500">{menu.category}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeCustomMenu(menu.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <Button 
          onClick={savePreferences}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          size="lg"
        >
          <Save className="h-5 w-5 mr-2" />
          {selectedSituation} 취향 저장하기
        </Button>
      </div>
    </div>
  );
};

export default PreferencesManager;
