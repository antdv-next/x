<script setup lang="tsx">
import type { BubbleListProps } from "@antdv-next/x";

import { ReloadOutlined } from "@antdv-next/icons";
import { BubbleList } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import {
  Button,
  Form,
  FormItem,
  Input,
  InputPassword,
  message,
  Select,
  Space,
  Steps,
  Typography,
} from "antdv-next";
import { computed, h, onMounted, reactive, ref, watch } from "vue";

import {
  XCardBox,
  XCardCard,
  type ActionPayload,
} from "@antdv-next/x-card";

const contentHeader =
  "Welcome to register! 🎉\n\nPlease fill in your information to create an account. We will verify your information step by step.";

type TextNode = { text: string; timestamp: number };
type CardNode = { timestamp: number; id: string };
type ContentType = { texts: TextNode[]; card: CardNode[] };

const role = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    typing: false,
    contentRender(content: ContentType | string) {
      if (!content || typeof content === "string") return null;

      const contentList = [...content.texts, ...content.card].sort(
        (a, b) => a.timestamp - b.timestamp,
      );

      return contentList.map((node, index) => {
        if ("text" in node && node.text) {
          return h(XMarkdown, { key: `text-${index}`, content: node.text });
        }

        if ("id" in node && node.id) {
          return h(XCardCard, { key: `card-${index}`, id: node.id });
        }

        return null;
      });
    },
  },
}));

// ─── RegistrationForm ──────────────────────────────────────────────────────
const RegistrationForm = {
  name: "RegistrationForm",
  props: {
    step: { type: [Number, String], default: 0 },
    status: { type: String, default: undefined },
    errorMessage: { type: String, default: "" },
    onAction: { type: Function, default: undefined },
    action: { type: Object, default: undefined },
  },
  setup(props: any) {
    // v0.8: literalString comes as string, coerce to number
    const numericStep = (): number =>
      typeof props.step === "string" ? parseInt(props.step, 10) || 0 : props.step ?? 0;

    const currentStep = ref<number>(numericStep());
    const formStatus = ref<string | null>(props.status ?? null);
    const formRef = ref<any>(null);
    const model = reactive<Record<string, any>>({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      accountType: "personal",
    });

    watch(
      () => props.step,
      () => {
        currentStep.value = numericStep();
      },
    );
    watch(
      () => props.status,
      v => {
        formStatus.value = v ?? null;
      },
    );

    const buildContext = (extra: Record<string, any>) => {
      const context: Record<string, any> = {};
      if (Array.isArray(props.action?.context)) {
        props.action.context.forEach((item: any) => {
          context[item.key] = extra;
        });
      }
      return context;
    };

    const handleSubmit = (values: any) => {
      const eventName = props.action?.name;
      if (!eventName) return;
      const context = buildContext({ step: 2, values, submit: true });
      props.onAction?.(eventName, context);
    };

    const handleNext = async () => {
      try {
        const fieldsToValidate =
          currentStep.value === 0 ? ["username", "email"] : ["password", "confirmPassword"];
        if (formRef.value?.validateFields) {
          await formRef.value.validateFields(fieldsToValidate);
        }

        const values = { ...model };

        const eventName = props.action?.name;
        if (eventName) {
          const context = buildContext({ step: currentStep.value + 1, values });
          props.onAction?.(eventName, context);
        }

        if (currentStep.value === 1) {
          handleSubmit(values);
        } else {
          currentStep.value = currentStep.value + 1;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log("Validation failed:", error);
      }
    };

    const handlePrev = () => {
      currentStep.value = currentStep.value - 1;
    };

    const steps = [
      { title: "Basic Info", description: "Username & Email" },
      { title: "Security", description: "Password" },
      { title: "Complete", description: "Account Created" },
    ];

    const accountTypeOptions = [
      { value: "personal", label: "Personal" },
      { value: "business", label: "Business" },
      { value: "developer", label: "Developer" },
    ];

    return () => (
      <div
        style={{
          borderRadius: "16px",
          border: "1.5px solid #e8e8e8",
          padding: "24px",
          background: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          minWidth: "480px",
          maxWidth: "600px",
        }}
      >
        <Steps current={currentStep.value} items={steps} style={{ marginBottom: "24px" }} />

        {formStatus.value === "error" && props.errorMessage && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: "16px",
              borderRadius: "8px",
              background: "#fff2f0",
              border: "1px solid #ffccc7",
            }}
          >
            <Typography.Text type="danger">{props.errorMessage}</Typography.Text>
          </div>
        )}

        <Form ref={formRef} layout="vertical" model={model}>
          {/* Step 0: Basic Info */}
          <div style={{ display: currentStep.value === 0 ? "block" : "none" }}>
            <FormItem
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
                { min: 3, message: "Username must be at least 3 characters!" },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message: "Only letters, numbers and underscores!",
                },
              ]}
              validateTrigger="blur"
            >
              <Input
                value={model.username}
                onUpdate:value={(v: string) => {
                  model.username = v;
                }}
                placeholder="Enter username"
                size="large"
              />
            </FormItem>

            <FormItem
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
              validateTrigger="blur"
            >
              <Input
                value={model.email}
                onUpdate:value={(v: string) => {
                  model.email = v;
                }}
                placeholder="Enter email"
                size="large"
              />
            </FormItem>
          </div>

          {/* Step 1: Security */}
          <div style={{ display: currentStep.value === 1 ? "block" : "none" }}>
            <FormItem
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 8, message: "Password must be at least 8 characters!" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "Must contain uppercase, lowercase and number!",
                },
              ]}
              validateTrigger="blur"
            >
              <InputPassword
                value={model.password}
                onUpdate:value={(v: string) => {
                  model.password = v;
                }}
                placeholder="Enter password"
                size="large"
              />
            </FormItem>

            <FormItem
              label="Confirm Password"
              name="confirmPassword"
              rules={[
                { required: true, message: "Please confirm your password!" },
                {
                  validator: (_rule: any, value: any) => {
                    if (!value || model.password === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                },
              ]}
              validateTrigger="blur"
            >
              <InputPassword
                value={model.confirmPassword}
                onUpdate:value={(v: string) => {
                  model.confirmPassword = v;
                }}
                placeholder="Confirm password"
                size="large"
              />
            </FormItem>

            <FormItem
              label="Account Type"
              name="accountType"
              rules={[{ required: true, message: "Please select account type!" }]}
            >
              <Select
                value={model.accountType}
                onUpdate:value={(v: any) => {
                  model.accountType = v as string;
                }}
                options={accountTypeOptions}
                size="large"
              />
            </FormItem>
          </div>

          {/* Step 2: Complete */}
          {currentStep.value === 2 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                background: "#f6ffed",
                borderRadius: "12px",
                border: "1px solid #b7eb8f",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <Typography.Title
                level={3}
                style={{ marginBottom: "8px", color: "#52c41a" }}
              >
                Registration Successful!
              </Typography.Title>
              <Typography.Text type="secondary">
                Your account has been created successfully.
              </Typography.Text>
            </div>
          )}
        </Form>

        {/* Action Buttons */}
        {currentStep.value < 2 && (
          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              marginTop: "24px",
            }}
          >
            <Button size="large" disabled={currentStep.value === 0} onClick={handlePrev}>
              Previous
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleNext}
              loading={formStatus.value === "loading"}
            >
              {currentStep.value === 1 ? "Submit" : "Next"}
            </Button>
          </Space>
        )}
      </div>
    );
  },
};

// ─── SuccessCard ───────────────────────────────────────────────────────────
const SuccessCard = {
  name: "SuccessCard",
  props: {
    username: { type: String, default: "" },
    email: { type: String, default: "" },
    accountType: { type: String, default: "" },
  },
  setup(props: any) {
    return () => (
      <div
        style={{
          borderRadius: "16px",
          border: "1.5px solid #52c41a",
          padding: "24px",
          background: "linear-gradient(135deg, #f6ffed 0%, #fff 100%)",
          boxShadow: "0 2px 12px rgba(82,196,26,0.15)",
          minWidth: "400px",
          maxWidth: "500px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
          <Typography.Title
            level={2}
            style={{ marginBottom: "8px", color: "#52c41a" }}
          >
            Welcome, {props.username}!
          </Typography.Title>
          <Typography.Text type="secondary">
            Your account has been created successfully.
          </Typography.Text>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "16px",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Typography.Text type="secondary">Email:</Typography.Text>
              <Typography.Text strong>{props.email}</Typography.Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Typography.Text type="secondary">Account Type:</Typography.Text>
              <Typography.Text strong style={{ textTransform: "capitalize" }}>
                {props.accountType}
              </Typography.Text>
            </div>
          </Space>
        </div>

        <Button type="primary" size="large" block>
          Start Exploring
        </Button>
      </div>
    );
  },
};

// ─── Streaming text ────────────────────────────────────────────────────────
function useStreamText(text: string) {
  const textRef = ref(0);
  const textIndex = ref(0);
  const textTimestamp = ref(0);
  const streamStatus = ref<"INIT" | "RUNNING" | "FINISHED">("INIT");
  let timer: ReturnType<typeof setInterval> | null = null;

  const run = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (textRef.value < text.length) {
        if (textTimestamp.value === 0) {
          textTimestamp.value = Date.now();
          streamStatus.value = "RUNNING";
        }
        textRef.value = Math.min(textRef.value + 3, text.length);
        textIndex.value = textRef.value;
      } else {
        streamStatus.value = "FINISHED";
        if (timer) clearInterval(timer);
      }
    }, 100);
  };

  const reset = () => {
    if (timer) clearInterval(timer);
    timer = null;
    textRef.value = 0;
    textTimestamp.value = 0;
    textIndex.value = 0;
    streamStatus.value = "INIT";
  };

  return {
    text: computed(() => text.slice(0, textIndex.value)),
    streamStatus,
    timestamp: textTimestamp,
    run,
    reset,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// v0.8 Agent Command definitions
// ═══════════════════════════════════════════════════════════════════════════
const FormSurfaceUpdateCommand = {
  surfaceUpdate: {
    surfaceId: "registration",
    components: [
      {
        id: "registration-form",
        component: {
          RegistrationForm: {
            step: { literalString: "0" },
            status: { path: "/status" },
            errorMessage: { path: "/errorMessage" },
            action: {
              name: "submit_step",
              context: [{ key: "formData", value: { path: "/formData" } }],
            },
          },
        },
      },
    ],
  },
};

const FormDataModelUpdateCommand = {
  dataModelUpdate: {
    surfaceId: "registration",
    contents: [{ key: "status", valueString: "" }],
  },
};

const FormBeginRenderingCommand = {
  beginRendering: { surfaceId: "registration", root: "registration-form" },
};

const ResultSurfaceUpdateCommand = (formData: any) => ({
  surfaceUpdate: {
    surfaceId: "result",
    components: [
      {
        id: "success-card",
        component: {
          SuccessCard: {
            username: { literalString: formData?.username ?? "" },
            email: { literalString: formData?.email ?? "" },
            accountType: { literalString: formData?.accountType ?? "personal" },
          },
        },
      },
    ],
  },
});

const ResultBeginRenderingCommand = {
  beginRendering: { surfaceId: "result", root: "success-card" },
};

// ─── App state ──────────────────────────────────────────────────────────────
const commandQueue = ref<any[]>([]);
const card = ref<CardNode[]>([]);
const sessionKey = ref(0);

const onAgentCommand = (command: any) => {
  if ("surfaceUpdate" in command) {
    const surfaceId = command.surfaceUpdate.surfaceId;
    if (!card.value.some(c => c.id === surfaceId)) {
      card.value = [...card.value, { id: surfaceId, timestamp: Date.now() }];
    }
  } else if ("deleteSurface" in command) {
    card.value = card.value.filter(c => c.id !== command.deleteSurface.surfaceId);
  }
  commandQueue.value = [...commandQueue.value, command];
};

const handleAction = (payload: ActionPayload) => {
  if (payload.name !== "submit_step") return;
  const { formData } = payload.context || {};

  if (formData?.submit) {
    message.success("Registration successful!");
    onAgentCommand({ deleteSurface: { surfaceId: "registration" } });
    setTimeout(() => {
      onAgentCommand(ResultSurfaceUpdateCommand(formData.values));
      onAgentCommand(ResultBeginRenderingCommand);
    }, 300);
  } else {
    message.info(`Step ${formData.step} completed`);
  }
};

const {
  text: textHeader,
  streamStatus: streamStatusHeader,
  timestamp: timestampHeader,
  run: runHeader,
  reset: resetHeader,
} = useStreamText(contentHeader);

const handleReload = () => {
  resetHeader();
  commandQueue.value = [
    ...commandQueue.value,
    { deleteSurface: { surfaceId: "registration" } },
    { deleteSurface: { surfaceId: "result" } },
  ];
  card.value = [];
  setTimeout(() => {
    sessionKey.value += 1;
    runHeader();
  }, 50);
};

const items = computed(() => [
  (() => {
    const textNodes = [
      { text: textHeader.value, timestamp: timestampHeader.value },
    ].filter(item => item.timestamp !== 0);

    const hasRenderableContent = textNodes.length > 0 || card.value.length > 0;

    return {
      content: hasRenderableContent
        ? ({ texts: textNodes, card: card.value } as ContentType)
        : "",
      typing: false,
      role: "assistant",
      key: sessionKey.value,
    };
  })(),
]);

onMounted(() => {
  runHeader();
});

watch(
  () => streamStatusHeader.value,
  value => {
    if (value === "FINISHED") {
      onAgentCommand(FormSurfaceUpdateCommand);
      onAgentCommand(FormDataModelUpdateCommand);
      onAgentCommand(FormBeginRenderingCommand);
    }
  },
);

const components = {
  RegistrationForm,
  SuccessCard,
};
</script>

<template>
  <div>
    <div style="margin-bottom: 16px">
      <Button type="primary" :icon="h(ReloadOutlined)" @click="handleReload">
        Reload
      </Button>
    </div>

    <XCardBox
      :key="sessionKey"
      :commands="commandQueue"
      :on-action="handleAction"
      :components="components"
    >
      <BubbleList :items="items" style="height: 620px" :role="role" />
    </XCardBox>
  </div>
</template>

<docs lang="zh-CN">
使用 XCard 实现 A2UI v0.8 协议的表单验证示例。演示了多步骤注册表单，每一步都进行字段校验，提交完成后展示成功卡片。
</docs>

<docs lang="en-US">
Form validation example with XCard implementing the A2UI v0.8 protocol. Demonstrates a multi-step registration form with per-step field validation, and a success card after submission.
</docs>
