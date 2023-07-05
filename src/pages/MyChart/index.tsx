import { listMyChartByPageUsingPOST } from '@/services/linbi/chartController';
import { useModel } from '@umijs/max';
import { Avatar, Card, Divider, List, message } from 'antd';
import Search from 'antd/es/input/Search';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

/**
 * 添加图表页面
 * @constructor
 */
const MyChartPage: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 4,
  };

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [loading, setLoading] = useState<boolean>(false);
  const [chartList, setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPOST(searchParams);
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);

        // 隐藏图表title
        if (res.data.records) {
          res.data.records.forEach((data) => {
            const titleOption = JSON.parse(data.genChart ?? '{}');
            titleOption.title = undefined;
            data.genChart = JSON.stringify(titleOption);
          });
        }
      } else {
        message.error('获取我的图表失败');
      }
    } catch (e: any) {
      message.error('获取我的的图表失败' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  return (
    <div className="my-chart-page">
      <div>
        <Search
          placeholder="请输入图表名称"
          loading={loading}
          enterButton
          onSearch={(value) => {
            // 设置搜索条件
            setSearchParams({
              ...initSearchParams,
              name: value,
            });
          }}
        />
        <div className="margin-16"></div>
      </div>
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 1,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page) => {
            setSearchParams({
              ...searchParams,
              current: page,
            });
          },
          pageSize: searchParams.pageSize,
          current: searchParams.current,
          total: total,
        }}
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card>
              <List.Item.Meta
                avatar={<Avatar src={currentUser.userAvatar} />}
                title={item.name}
                description={item.charType ? '图表类型：' + item.charType : undefined}
              />
              <Divider />
              {'分析目标：' + item.goal}
              <Divider />
              <ReactECharts option={JSON.parse(item.genChart ?? '{}')} />
              <Divider />
              {'分析结果：' + item.genResult}
              {/*{item.genChart }*/}
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};
export default MyChartPage;
