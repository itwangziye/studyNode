# ---- 阶段 1:builder(编译 TS → JS + 生成 Prisma Client)----
FROM node:22-alpine AS builder

WORKDIR /app

# ① 复制依赖文件(3 个文件)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# ② 装依赖(--ignore-scripts 避免 pnpm 11 构建审批问题)
# 配淘宝镜像:容器内下载更快
RUN npm config set registry https://registry.npmmirror.com \
  && npm install -g pnpm \
  && pnpm config set registry https://registry.npmmirror.com \
  && pnpm install --no-frozen-lockfile --ignore-scripts

# ③ 复制源码
COPY . .

# ④ 生成 Prisma Client(必须在编译前)
RUN npx prisma generate

# ⑤ 编译 TS → JS
RUN pnpm run build:tsc


# ---- 阶段 2:prod(只跑编译后的 JS)----
FROM node:22-alpine AS prod

WORKDIR /app

# ⑥ 只装生产依赖(--prod 不要 devDependencies)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm config set registry https://registry.npmmirror.com \
  && npm install -g pnpm \
  && pnpm config set registry https://registry.npmmirror.com \
  && pnpm install --no-frozen-lockfile --prod --ignore-scripts

# ⑦ 从 builder 阶段复制编译产物
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]