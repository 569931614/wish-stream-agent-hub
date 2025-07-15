import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRequirements, saveRequirement } from '@/lib/data';

export default function ApiTest() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testGetRequirements = async () => {
    setLoading(true);
    setError(null);
    addLog('开始测试获取需求列表...');
    
    try {
      const data = await getRequirements();
      setRequirements(data);
      addLog(`成功获取 ${data.length} 个需求`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误';
      setError(errorMsg);
      addLog(`获取需求失败: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateRequirement = async () => {
    setLoading(true);
    setError(null);
    addLog('开始测试创建需求...');
    
    try {
      const newReq = await saveRequirement({
        title: '前端测试需求',
        description: '这是从前端创建的测试需求',
        allowSuggestions: true,
        willingToPay: true,
        paymentAmount: 50
      }, '前端测试用户');
      
      addLog(`成功创建需求: ${newReq.title}`);
      // 重新获取列表
      await testGetRequirements();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误';
      setError(errorMsg);
      addLog(`创建需求失败: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    addLog('测试API连接...');
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        const data = await response.json();
        addLog(`API连接成功: ${JSON.stringify(data)}`);
      } else {
        addLog(`API连接失败: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      addLog(`API连接错误: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  useEffect(() => {
    testApiConnection();
    testGetRequirements();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API 测试页面</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testGetRequirements} disabled={loading}>
                获取需求列表
              </Button>
              <Button onClick={testCreateRequirement} disabled={loading}>
                创建测试需求
              </Button>
              <Button onClick={testApiConnection} disabled={loading}>
                测试API连接
              </Button>
            </div>
            
            {error && (
              <div className="p-4 bg-red-100 border border-red-300 rounded text-red-700">
                错误: {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>需求列表 ({requirements.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {requirements.map((req, index) => (
                      <div key={req.id || index} className="p-2 bg-gray-100 rounded text-sm">
                        <div className="font-medium">{req.title}</div>
                        <div className="text-gray-600">用户: {req.username}</div>
                        <div className="text-gray-600">评论: {req.comments?.length || 0}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>调试日志</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-60 overflow-y-auto text-sm font-mono">
                    {logs.map((log, index) => (
                      <div key={index} className="text-gray-700">
                        {log}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
