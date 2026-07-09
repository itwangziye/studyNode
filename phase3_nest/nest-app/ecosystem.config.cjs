# ============================================================
# ecosystem.config.cjs —— PM2 进程管理配置
# 作用:守护 Node 进程,崩了自动重启,日志自动收集
# 用法:pm2 start ecosystem.config.cjs
# ============================================================
module.exports = {
  apps: [{
    name: 'nest-app',                    // 进程名(pm2 list 显示的名字)
    script: 'dist/main.js',              // 启动文件(编译后的 JS)
    instances: 1,                        // 实例数(单核用1,多核用 'max' 开集群)
    autorestart: true,                   // 崩溃自动重启
    watch: false,                        // 生产环境关闭文件监听
    max_memory_restart: '300M',          // 内存超 300M 自动重启(防内存泄漏)
    env: {
      NODE_ENV: 'production',            // 生产环境变量
      PORT: 3000,
    },
    // 日志配置
    error_file: './logs/error.log',      // 错误日志
    out_file: './logs/out.log',          // 标准输出日志
    log_date_format: 'YYYY-MM-DD HH:mm:ss',  // 日志带时间戳
  }]
}
