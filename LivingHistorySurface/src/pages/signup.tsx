import { useState, useCallback, useMemo } from "react";
import { Button, Card, Checkbox, Form, Input, Layout, Modal, Select, message } from "antd";
import { _Item, _Password } from "@/components/styled";
import { RegisterFormData } from "../modals/types";
import { formItemLayout, tailFormItemLayout } from "../styles/component-props";
import { useRouter } from "next/router";
import _styles from "../styles/signup.module.css";
import styles from "../styles/login.module.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

const { Content } = Layout;
const { Option } = Select;

const Signup: React.FC = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [data, setData] = useState<RegisterFormData>();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [checkboxDisabled, setCheckboxDisabled] = useState<boolean>(false);

    useMemo(() => data, [data]);

    const fetchData = useCallback(async (data: RegisterFormData) => {
        try {
            messageApi.open({
                key: "signup",
                type: "loading",
                content: "Hold thee a moment, fair soul...",
            });
            const response = await fetch("http://localhost:8080/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                messageApi.success({
                    key: "signup",
                    content: "Rejoice, fair traveler, for thou hast attained the boon thou sought!",
                    duration: 2,
                });
                setTimeout(() => {
                    messageApi.info({
                        key: "signup",
                        content: "You are being redirected to the login page.",
                        duration: 1
                    });
                }, 2000);
                setTimeout(async () => {
                    await router.push(`/login?value=${data?.username}`);
                }, 3000);
            }
            else if (response.status === 400) {
                messageApi.error({
                    key: "signup",
                    content: "A duplicate account with this username-address cannot persist.",
                    duration: 2
                });
            }
            else if (response.status === 500) {
                messageApi.error({
                    key: "signup",
                    content: "'Til the servers are up and the problem is gone.",
                    duration: 2
                });
            }
        } catch (error) {
            messageApi.error({
                key: "signup",
                content: "Unhappily, try once more anon, at a later hour this task be done.",
                duration: 2
            });
        }
    }, [router, messageApi]);

    const onFinish = useCallback(async (values: RegisterFormData) => {
        const formData: RegisterFormData = {
            email: values.email,
            password: values.password,
            username: values.username,
            nickname: values.nickname,
            gender: values.gender
        };
        setData(formData);
        await fetchData(formData);
    }, [fetchData, setData]);

    return (
        <Layout className={styles["layout"]}>
            {contextHolder}
            <Header />
            <Content className={styles["content"]}>
                <Card bodyStyle={{ paddingBlockEnd: "0px" }}>
                    <Form
                        {...formItemLayout}
                        className={_styles["form"]}
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        initialValues={{ prefix: "90" }}
                        style={{ maxWidth: 600 }}
                        scrollToFirstError>
                        <_Item
                            className={_styles["_item"]}
                            name="email"
                            label="E-mail"
                            rules={[{
                                type: "email",
                                message: "Do not jest, for this is not an electronic letter!"
                            },
                            {
                                required: true,
                                message: "We must know where to send our messages, so prithee, inform us."
                            }]}>
                            <Input />
                        </_Item>
                        <_Item
                            className={_styles["_item"]}
                            name="password"
                            label="Password"
                            rules={[
                                {
                                    required: true,
                                    message: "I shall not reveal thy secret to anyone... mayhaps.",
                                },
                            ]}
                            hasFeedback>
                            <_Password />
                        </_Item>
                        <_Item
                            {...formItemLayout}
                            className={_styles["_item"]}
                            name="confirm"
                            label="Confirm Password"
                            dependencies={["password"]}
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: "Equality is the crux of this matter.",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error("Equality is the crux of this matter.")
                                        );
                                    },
                                }),
                            ]}>
                            <_Password />
                        </_Item>
                        <_Item
                            className={_styles["_item"]}
                            name="username"
                            label="Username"
                            rules={[{
                                required: true,
                                message: "Every soul hath a name, and deserves to be called by it.",
                                whitespace: true
                            }]}>
                            <Input />
                        </_Item>
                        <_Item
                            className={_styles["_item"]}
                            name="nickname"
                            label="Nickname"
                            tooltip="Thus shall others perceive thee, as portrayed herein."
                            rules={[{
                                required: true,
                                message: "Disclose thy true identity, that we may know thee better!",
                                whitespace: true
                            }]}>
                            <Input />
                        </_Item>
                        <Form.Item name="gender" label="Gender">
                            <Select placeholder="Human">
                                <Option value="Male">{"Male"}</Option>
                                <Option value="Female">{"Female"}</Option>
                                <Option value="Other">{"Other"}</Option>
                            </Select>
                        </Form.Item>
                        <_Item
                            className={_styles["_item-button"]}
                            {...tailFormItemLayout}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className={styles["form-button-login"]}
                                block>
                                {"Submit"}
                            </Button>
                        </_Item>
                        <Form.Item
                            name="agreement"
                            valuePropName="checked"
                            initialValue={false}
                            rules={[{
                                validator: (_, value) => value
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Thou canst not evade this, for it is thine obligation.")),
                            }]}
                            {...tailFormItemLayout}>
                            <Checkbox
                                onChange={(e) => {
                                    form.setFieldValue("agreement", e.target.checked);
                                }}
                                disabled={checkboxDisabled}>
                                {"I agree to the"}
                            </Checkbox>
                            <Button
                                className={_styles["button"]}
                                type={"link"}
                                onClick={() => setModalVisible(true)}>
                                {"Terms and Conditions"}
                            </Button>
                        </Form.Item>
                        <Modal
                            title="Terms and Conditions"
                            open={modalVisible}
                            bodyStyle={{ fontFamily: "sans-serif" }}
                            closable={false}
                            footer={[
                                <>
                                    <Button
                                        className={styles["form-button-login"]}
                                        type={"primary"}
                                        onClick={() => {
                                            setModalVisible(false);
                                            setCheckboxDisabled(false);
                                        }}>
                                        {"Accept"}
                                    </Button>
                                    <Button
                                        className={_styles["model-button"]}
                                        type={"primary"}
                                        onClick={() => {
                                            setModalVisible(false);
                                            setCheckboxDisabled(true);
                                        }}>
                                        {"Decline"}
                                    </Button>
                                </>]}>
                            {"Verily, by submitting this form, thou dost accept the sacrifice of thine unborn child to the devil. May God forbid thy sin and cleanse thy soul, for such a pact with the infernal powers canst bring naught but damnation upon thee."}
                        </Modal>
                    </Form>
                </Card>
            </Content>
            <Footer />
        </Layout>
    );
};

export default Signup;