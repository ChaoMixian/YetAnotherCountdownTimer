@echo off
setlocal

:: 设置项目目录和输出目录
set PROJECT_DIR=.
set OUTPUT_DIR=Release

:: 配置目标架构
set TARGETS=x86 arm64 x64

:: 设置 .NET SDK 版本
set DOTNET_VERSION=6.0

:: 切换到项目目录
cd /d %PROJECT_DIR%

:: 确保使用正确的 .NET SDK 版本
echo Using .NET %DOTNET_VERSION% SDK...
dotnet --version


:: 检查输出目录是否存在
if exist %OUTPUT_DIR% (
    echo Output directory already exists. Deleting it...
    rmdir /s /q %OUTPUT_DIR%
    if errorlevel 1 (
        echo Failed to delete output directory: %OUTPUT_DIR%
        exit /b 1
    )
)

:: 创建输出目录
mkdir %OUTPUT_DIR%

:: 循环构建不同架构的单文件 EXE，分别为带运行时和不带运行时
for %%T in (%TARGETS%) do (
    echo Building for %%T...

    :: 不带运行时的构建（framework-dependent）
    echo Building without runtime for %%T...
    dotnet publish --configuration Release --runtime win-%%T --self-contained=false --output "%OUTPUT_DIR%" /p:PublishSingleFile=true
    move "%OUTPUT_DIR%\YetAnotherCountdownTimerNext.exe" "%OUTPUT_DIR%\YetAnotherCountdownTimer-win-%%T-framework-dependent.exe"
    echo Framework-dependent build for %%T completed. Output: %OUTPUT_DIR%\YetAnotherCountdownTimer-win-%%T-framework-dependent.exe

    :: 带运行时的构建（self-contained）
    echo Building with runtime for %%T...
    dotnet publish --configuration Release --runtime win-%%T --self-contained=true --output "%OUTPUT_DIR%" /p:PublishSingleFile=true
    move "%OUTPUT_DIR%\YetAnotherCountdownTimerNext.exe" "%OUTPUT_DIR%\YetAnotherCountdownTimer-win-%%T-self-contained.exe"
    echo Self-contained build for %%T completed. Output: %OUTPUT_DIR%\YetAnotherCountdownTimer-win-%%T-self-contained.exe
)

echo All builds are completed.
pause
