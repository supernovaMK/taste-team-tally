import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowDown, Users, Menu as MenuIcon, Check, Heart, Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RandomSpinner from './RandomSpinner';

interface MenuSelectionRoomProps {
  roomId: string;
  userName: string;
  onLeaveRoom: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  emoji: string;
  isCustom?: boolean;
}

interface UserSelection {
  [userId: string]: {
    name: string;
    liked: string[];
    disliked: string[];
    completed: boolean;
  };
}

// 미리 설정된 취향 (실제로는 localStorage나 서버에서 가져올 수 있음)
const defaultPreferences = {
  liked: ['1', '6', '11', '16'], // 김치찌개, 초밥, 파스타, 짜장면
  disliked: ['8', '13', '18'] // 돈카츠, 스테이크, 탕수육
};

const MenuSelectionRoom: React.FC<MenuSelectionRoomProps> = ({ roomId, userName, onLeaveRoom }) => {
  const [currentUser] = useState(`user_${Date.now()}`);
  const [userSelections, setUserSelections] = useState<UserSelection>({});
  const [availableMenus, setAvailableMenus] = useState<MenuItem[]>([]);
  const [likedMenus, setLikedMenus] = useState<MenuItem[]>([]);
  const [dislikedMenus, setDislikedMenus] = useState<MenuItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [finalMenus, setFinalMenus] = useState<MenuItem[]>([]);
  const [showSpinner, setShowSpinner] = useState(false);
  const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
  
  // Manual menu addition states
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('한식');
  const [newMenuEmoji, setNewMenuEmoji] = useState('🍽️');

  const baseMenuData: MenuItem[] = [
    // 한식
    { id: '1', name: '김치찌개', category: '한식', emoji: '🍲' },
    { id: '2', name: '불고기', category: '한식', emoji: '🥩' },
    { id: '3', name: '비빔밥', category: '한식', emoji: '🍱' },
    { id: '4', name: '냉면', category: '한식', emoji: '🍜' },
    { id: '5', name: '삼겹살', category: '한식', emoji: '🥓' },
    
    // 일식
    { id: '6', name: '초밥', category: '일식', emoji: '🍣' },
    { id: '7', name: '라멘', category: '일식', emoji: '🍜' },
    { id: '8', name: '돈카츠', category: '일식', emoji: '🍖' },
    { id: '9', name: '우동', category: '일식', emoji: '🍲' },
    { id: '10', name: '규동', category: '일식', emoji: '🍚' },
    
    // 양식
    { id: '11', name: '파스타', category: '양식', emoji: '🍝' },
    { id: '12', name: '피자', category: '양식', emoji: '🍕' },
    { id: '13', name: '스테이크', category: '양식', emoji: '🥩' },
    { id: '14', name: '샐러드', category: '양식', emoji: '🥗' },
    { id: '15', name: '햄버거', category: '양식', emoji: '🍔' },
    
    // 중식
    { id: '16', name: '짜장면', category: '중식', emoji: '🍜' },
    { id: '17', name: '짬뽕', category: '중식', emoji: '🍲' },
    { id: '18', name: '탕수육', category: '중식', emoji: '🍖' },
    { id: '19', name: '마파두부', category: '중식', emoji: '🌶️' },
    { id: '20', name: '볶음밥', category: '중식', emoji: '🍚' },
  ];

  useEffect(() => {
    // Load custom menus from preferences and merge with base menus
    const loadMenusWithCustom = () => {
      try {
        const savedPreferences = localStorage.getItem('mealPreferences');
        let customMenus: MenuItem[] = [];
        
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);
          preferences.forEach((pref: any) => {
            customMenus = [...customMenus, ...pref.customMenus];
          });
        }
        
        // Remove duplicates and merge
        const uniqueCustomMenus = customMenus.filter((menu, index, self) => 
          index === self.findIndex(m => m.name === menu.name)
        );
        
        const mergedMenus = [...baseMenuData, ...uniqueCustomMenus];
        setAllMenus(mergedMenus);
        setAvailableMenus(mergedMenus);
      } catch (error) {
        console.log('No saved preferences found, using base menus');
        setAllMenus(baseMenuData);
        setAvailableMenus(baseMenuData);
      }
    };

    loadMenusWithCustom();
    
    // Initialize current user
    setUserSelections(prev => ({
      ...prev,
      [currentUser]: {
        name: userName,
        liked: [],
        disliked: [],
        completed: false
      }
    }));
  }, [currentUser, userName]);

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

    const updatedMenus = [...allMenus, newMenu];
    setAllMenus(updatedMenus);
    setAvailableMenus(prev => [...prev, newMenu]);

    setNewMenuName('');
    setNewMenuEmoji('🍽️');
    setShowAddMenu(false);

    toast({
      title: "메뉴가 추가되었습니다!",
      description: `${newMenuName}이(가) 선택지에 추가되었습니다.`,
    });
  };

  const loadMyPreferences = () => {
    // 기존 메뉴들을 모두 available로 돌리기
    setAvailableMenus(allMenus);
    setLikedMenus([]);
    setDislikedMenus([]);

    // 선호 메뉴들을 liked로 이동
    const preferredLikedMenus = allMenus.filter(menu => defaultPreferences.liked.includes(menu.id));
    const preferredDislikedMenus = allMenus.filter(menu => defaultPreferences.disliked.includes(menu.id));
    
    setLikedMenus(preferredLikedMenus);
    setDislikedMenus(preferredDislikedMenus);
    
    // Available에서 선호/비선호 메뉴들 제거
    const remainingMenus = allMenus.filter(menu => 
      !defaultPreferences.liked.includes(menu.id) && 
      !defaultPreferences.disliked.includes(menu.id)
    );
    setAvailableMenus(remainingMenus);

    // Update user selections
    setUserSelections(prev => ({
      ...prev,
      [currentUser]: {
        ...prev[currentUser],
        liked: defaultPreferences.liked,
        disliked: defaultPreferences.disliked
      }
    }));

    toast({
      title: "취향이 불러와졌습니다!",
      description: "미리 설정된 선호도가 적용되었습니다.",
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const draggedMenu = allMenus.find(menu => menu.id === draggableId);
    if (!draggedMenu) return;

    // Remove from source
    if (source.droppableId === 'available') {
      setAvailableMenus(prev => prev.filter(menu => menu.id !== draggableId));
    } else if (source.droppableId === 'liked') {
      setLikedMenus(prev => prev.filter(menu => menu.id !== draggableId));
    } else if (source.droppableId === 'disliked') {
      setDislikedMenus(prev => prev.filter(menu => menu.id !== draggableId));
    }

    // Add to destination
    if (destination.droppableId === 'available') {
      setAvailableMenus(prev => [...prev, draggedMenu]);
    } else if (destination.droppableId === 'liked') {
      setLikedMenus(prev => [...prev, draggedMenu]);
    } else if (destination.droppableId === 'disliked') {
      setDislikedMenus(prev => [...prev, draggedMenu]);
    }

    // Update user selections
    setUserSelections(prev => ({
      ...prev,
      [currentUser]: {
        ...prev[currentUser],
        liked: destination.droppableId === 'liked' ? 
          [...(prev[currentUser]?.liked || []), draggableId] : 
          (prev[currentUser]?.liked || []).filter(id => id !== draggableId),
        disliked: destination.droppableId === 'disliked' ? 
          [...(prev[currentUser]?.disliked || []), draggableId] : 
          (prev[currentUser]?.disliked || []).filter(id => id !== draggableId)
      }
    }));
  };

  const completeSelection = () => {
    setUserSelections(prev => ({
      ...prev,
      [currentUser]: {
        ...prev[currentUser],
        completed: true
      }
    }));

    // 강화된 메뉴 선정 로직
    // 1. 좋아하는 메뉴 우선
    // 2. 중립 메뉴 (좋아하지도 싫어하지도 않는 메뉴) 포함
    const likedMenuIds = likedMenus.map(menu => menu.id);
    const dislikedMenuIds = dislikedMenus.map(menu => menu.id);
    const neutralMenuIds = availableMenus.map(menu => menu.id);
    
    // 최종 추천: 좋아하는 메뉴 + 중립 메뉴 (싫어하는 메뉴는 제외)
    const recommendedMenuIds = [...likedMenuIds, ...neutralMenuIds];
    const finalMenusResult = allMenus.filter(menu => recommendedMenuIds.includes(menu.id));
    
    // 좋아하는 메뉴를 우선순위로 정렬
    const sortedFinalMenus = finalMenusResult.sort((a, b) => {
      const aIsLiked = likedMenuIds.includes(a.id);
      const bIsLiked = likedMenuIds.includes(b.id);
      
      if (aIsLiked && !bIsLiked) return -1;
      if (!aIsLiked && bIsLiked) return 1;
      return 0;
    });

    setFinalMenus(sortedFinalMenus);
    setShowResults(true);

    toast({
      title: "선택 완료!",
      description: `${likedMenus.length}개의 선호 메뉴와 ${availableMenus.length}개의 중립 메뉴가 추천되었습니다.`,
    });
  };

  const shareRoom = () => {
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "링크가 복사되었습니다!",
      description: "팀원들에게 공유해보세요.",
    });
  };

  const categories = ['한식', '일식', '양식', '중식', '기타'];

  if (showResults) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center py-6">
            <h1 className="text-3xl font-bold text-green-600 mb-2">🎉 결과 발표!</h1>
            <p className="text-gray-600">추천 메뉴를 확인해보세요</p>
            <p className="text-sm text-gray-500 mt-1">방 코드: {roomId}</p>
          </div>

          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">🍽️ 추천 메뉴</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {finalMenus.map((menu, index) => {
                const isLiked = likedMenus.some(liked => liked.id === menu.id);
                return (
                  <div key={menu.id} className={`flex items-center justify-between p-3 rounded-lg ${
                    isLiked ? 'bg-gradient-to-r from-green-100 to-blue-100' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{menu.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-800 flex items-center space-x-1">
                          <span>{menu.name}</span>
                          {isLiked && <Heart className="h-4 w-4 text-red-500 fill-current" />}
                          {menu.isCustom && <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded">커스텀</span>}
                        </p>
                        <p className="text-sm text-gray-500">{menu.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">#{index + 1}</p>
                      {isLiked && <p className="text-xs text-red-500">선호</p>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              onClick={() => setShowSpinner(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              size="lg"
            >
              🎲 랜덤으로 최종 결정하기
            </Button>

            <Button 
              onClick={onLeaveRoom}
              variant="outline"
              className="w-full border-gray-200"
            >
              새로운 방 만들기
            </Button>
          </div>
        </div>

        {showSpinner && (
          <RandomSpinner 
            menus={finalMenus}
            onResult={(selectedMenu) => {
              setShowSpinner(false);
              toast({
                title: "🎉 최종 결정!",
                description: `${selectedMenu.name}(으)로 결정되었습니다!`,
              });
            }}
            onClose={() => setShowSpinner(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold text-orange-600">🍽️ 지땅음</h1>
            <p className="text-sm text-gray-600">방 코드: {roomId}</p>
          </div>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-200">
                  QR 코드
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>방 공유하기</DialogTitle>
                  <DialogDescription>
                    QR 코드를 스캔하거나 링크를 복사해서 팀원들을 초대하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4">
                  <QRCodeSVG value={`${window.location.origin}?room=${roomId}`} size={200} />
                  <Button onClick={shareRoom} className="w-full">
                    링크 복사하기
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              onClick={onLeaveRoom}
              variant="outline" 
              size="sm"
              className="border-gray-200"
            >
              나가기
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700 text-center">
              <span className="font-medium">드래그해서 선호도를 표시하세요!</span><br />
              음식을 '좋아요' 또는 '싫어요' 영역으로 옮겨보세요
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            onClick={loadMyPreferences}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
          >
            <Heart className="h-4 w-4 mr-2" />
            나의 취향 불러오기
          </Button>

          <Dialog open={showAddMenu} onOpenChange={setShowAddMenu}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="border-gray-200"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>메뉴 추가하기</DialogTitle>
                <DialogDescription>
                  원하는 메뉴를 직접 추가해보세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">메뉴 이름</label>
                    <Input
                      placeholder="예: 떡볶이"
                      value={newMenuName}
                      onChange={(e) => setNewMenuName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">이모지</label>
                    <Input
                      placeholder="🍽️"
                      value={newMenuEmoji}
                      onChange={(e) => setNewMenuEmoji(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">카테고리</label>
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
                  메뉴 추가하기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Available Menus by Category */}
          <div className="space-y-4">
            {categories.map(category => {
              const categoryMenus = availableMenus.filter(menu => menu.category === category);
              if (categoryMenus.length === 0) return null;
              
              return (
                <Card key={category} className="shadow-lg border border-gray-200 bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-800">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="available">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`grid grid-cols-2 gap-2 min-h-[60px] p-2 rounded-lg transition-colors ${
                            snapshot.isDraggingOver ? 'bg-gray-100' : 'bg-gray-50'
                          }`}
                        >
                          {categoryMenus.map((menu, index) => (
                            <Draggable key={menu.id} draggableId={menu.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-3 bg-white rounded-lg shadow-sm border-2 border-gray-200 cursor-grab active:cursor-grabbing transition-all ${
                                    snapshot.isDragging ? 'shadow-lg border-orange-400 rotate-2 scale-105' : 'hover:shadow-md hover:border-orange-300'
                                  }`}
                                >
                                  <div className="text-center">
                                    <div className="text-2xl mb-1">{menu.emoji}</div>
                                    <div className="text-sm font-medium text-gray-800 flex items-center justify-center space-x-1">
                                      <span>{menu.name}</span>
                                      {menu.isCustom && <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded">💎</span>}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selection Areas */}
          <div className="space-y-4 mt-6">
            {/* Liked */}
            <Card className="shadow-lg border border-green-200 bg-gradient-to-r from-green-100 to-emerald-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-700 flex items-center space-x-2">
                  <span>😋</span>
                  <span>먹고 싶어요</span>
                  <span className="text-sm text-green-600">({likedMenus.length}개)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="liked">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`grid grid-cols-2 gap-2 min-h-[80px] p-3 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver ? 'border-green-400 bg-green-50' : 'border-green-300 bg-green-50/50'
                      }`}
                    >
                      {likedMenus.map((menu, index) => (
                        <Draggable key={menu.id} draggableId={menu.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-2 bg-white rounded-lg shadow-sm border border-green-200 cursor-grab active:cursor-grabbing transition-all ${
                                snapshot.isDragging ? 'shadow-lg border-green-400 rotate-2 scale-105' : 'hover:shadow-md'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-xl mb-1">{menu.emoji}</div>
                                <div className="text-xs font-medium text-gray-800 flex items-center justify-center space-x-1">
                                  <span>{menu.name}</span>
                                  {menu.isCustom && <span className="text-xs">💎</span>}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {likedMenus.length === 0 && !snapshot.isDraggingOver && (
                        <div className="col-span-2 text-center text-green-600 text-sm py-4">
                          먹고 싶은 음식을 여기로 드래그하세요
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>

            {/* Disliked */}
            <Card className="shadow-lg border border-red-200 bg-gradient-to-r from-red-100 to-pink-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-red-700 flex items-center space-x-2">
                  <span>😞</span>
                  <span>먹고 싶지 않아요</span>
                  <span className="text-sm text-red-600">({dislikedMenus.length}개)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="disliked">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`grid grid-cols-2 gap-2 min-h-[80px] p-3 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver ? 'border-red-400 bg-red-50' : 'border-red-300 bg-red-50/50'
                      }`}
                    >
                      {dislikedMenus.map((menu, index) => (
                        <Draggable key={menu.id} draggableId={menu.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-2 bg-white rounded-lg shadow-sm border border-red-200 cursor-grab active:cursor-grabbing transition-all ${
                                snapshot.isDragging ? 'shadow-lg border-red-400 rotate-2 scale-105' : 'hover:shadow-md'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-xl mb-1">{menu.emoji}</div>
                                <div className="text-xs font-medium text-gray-800 flex items-center justify-center space-x-1">
                                  <span>{menu.name}</span>
                                  {menu.isCustom && <span className="text-xs">💎</span>}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {dislikedMenus.length === 0 && !snapshot.isDraggingOver && (
                        <div className="col-span-2 text-center text-red-600 text-sm py-4">
                          먹고 싫지 않은 음식을 여기로 드래그하세요
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        </DragDropContext>

        {/* Complete Button */}
        <div className="pt-4">
          <Button 
            onClick={completeSelection}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            size="lg"
            disabled={likedMenus.length === 0 && availableMenus.length === allMenus.length}
          >
            <Check className="h-5 w-5 mr-2" />
            선택 완료하기
          </Button>
          {likedMenus.length === 0 && availableMenus.length === allMenus.length && (
            <p className="text-center text-sm text-gray-500 mt-2">
              최소 1개 이상의 음식을 분류해주세요
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuSelectionRoom;
