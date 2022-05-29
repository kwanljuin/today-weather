import { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Divider,
  List,
  Button,
  Tooltip,
  Form,
  Input,
  Space,
  Grid,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";

import "./App.css";
import moment from "moment";

const { Header, Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

function App() {
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState();
  const [history, setHistory] = useState([]);

  const onReset = () => form.resetFields();

  const onRemoveHistory = (item) => {
    const updatedHistory = history.filter((record) => record !== item);
    setHistory(updatedHistory);
    // Save to local storage to keep history
    localStorage.setItem("history", JSON.stringify(updatedHistory));
  };

  const fetchWeather = (values) => {
    setLoading(true);
    if (
      values.cityName == null ||
      values.cityName === "" ||
      values.countryCode == null ||
      values.countryCode === ""
    ) {
      message.error("Fill all required Input");
    } else {
      var url = `https://api.openweathermap.org/data/2.5/weather?q=${values.cityName},${values.countryCode}&appid=1b81668fc60a1d1905a3e5a311d45414`;

      fetch(url)
        .then(function (response) {
          if (response.ok) {
            return response.json();
          } else {
            console.log(response);
            message.error(response.statusText);
            throw new Error(response.statusText);
          }
        })
        .then(function (response) {
          setWeatherData(response);
          const updatedHistory = [
            { ...values, time: moment().format("YYYY-MM-DD HH:mm A") },
            ...history,
          ];
          setHistory(updatedHistory);
          // Save to local storage to keep history
          localStorage.setItem("history", JSON.stringify(updatedHistory));
          setLoading(false);
        });
    }
  };

  // get history from local storage when initialise
  useEffect(() => {
    const value = localStorage.getItem("history");
    if (value) {
      setHistory(JSON.parse(value));
    }
  }, []);

  return (
    <Layout>
      <Header
        style={{
          color: "#fff",
          background: "#1890ff",
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Today's Weather
      </Header>
      <Content style={{ padding: "50px 50px", background: "#fff" }}>
        {/* User Input */}
        <Row>
          <Form
            layout={screens.md === true ? "inline" : "vertical"}
            form={form}
            initialValues={{}}
            onFinish={fetchWeather}
          >
            <Form.Item name="cityName" label="City Name">
              <Input placeholder="Singapore" />
            </Form.Item>
            <Form.Item name="countryCode" label="Country Code">
              <Input placeholder="SG" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button htmlType="button" onClick={onReset}>
                  Reset
                </Button>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Row>

        {/* Search Result */}
        {weatherData != null ? (
          <Card style={{ margin: "24px auto" }} loading={loading}>
            <Row justify="center">
              <Col
                style={{
                  padding: "24px 36px",
                  margin: "auto 0",
                }}
              >
                <p style={{ textAlign: "end" }}>
                  {`${weatherData?.name}, ${weatherData?.sys?.country}`}
                </p>
                <Title level={2} style={{ textAlign: "end" }}>
                  {weatherData?.weather[0]?.main}
                </Title>
              </Col>

              <Col style={{ paddingLeft: 24 }}>
                <Row>
                  <p className="resultLabel">Description:</p>
                  {weatherData?.weather[0]?.description}
                </Row>
                <Row>
                  <p className="resultLabel">Temperature:</p>
                  {/* Convert from Kelvin to Celsius */}
                  {`${(weatherData?.main?.temp_min - 273.15)?.toFixed(2)}°C ~ 
                    ${(weatherData?.main?.temp_max - 273.15)?.toFixed(2)}°C`}
                </Row>
                <Row>
                  <p className="resultLabel">Humidity:</p>
                  {weatherData?.main?.humidity}
                </Row>
                <Row>
                  <p className="resultLabel">Time:</p>
                  {moment.unix(weatherData?.dt).format("YYYY-MM-DD HH:mm A")}
                </Row>
              </Col>
            </Row>
          </Card>
        ) : (
          <div style={{ height: 24 }} />
        )}

        {/* Search History */}
        <Divider orientation="center">Search History</Divider>

        <List
          dataSource={history}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Tooltip title="Search">
                  <Button
                    shape="circle"
                    icon={<SearchOutlined onClick={() => fetchWeather(item)} />}
                  />
                </Tooltip>,
                <Tooltip title="Remove">
                  <Button
                    shape="circle"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onRemoveHistory(item)}
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                title={`${item.cityName}, ${item.countryCode}`}
                description={`Date Search: ${item.time}`}
              />
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
}

export default App;
