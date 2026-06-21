package de.letschew.regelexperte;

import android.content.Intent;
import android.net.Uri;
import androidx.core.content.FileProvider;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;

/**
 * Öffnet den System-Installer für eine bereits heruntergeladene APK.
 * Die Datei muss in einem Ordner liegen, den der FileProvider kennt
 * (siehe res/xml/file_paths.xml -> cache-path), z. B. Directory.Cache.
 */
@CapacitorPlugin(name = "ApkInstaller")
public class ApkInstallerPlugin extends Plugin {

    @PluginMethod
    public void install(PluginCall call) {
        String path = call.getString("path");
        if (path == null || path.isEmpty()) {
            call.reject("Pfad zur APK fehlt.");
            return;
        }
        try {
            // downloadFile liefert je nach Plattform "file:///..." oder einen reinen Pfad.
            String filePath = path.startsWith("file://") ? Uri.parse(path).getPath() : path;
            File apk = new File(filePath);
            if (!apk.exists()) {
                call.reject("APK nicht gefunden: " + filePath);
                return;
            }
            Uri uri = FileProvider.getUriForFile(
                getContext(),
                getContext().getPackageName() + ".fileprovider",
                apk
            );
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Installation konnte nicht gestartet werden: " + e.getMessage());
        }
    }
}
