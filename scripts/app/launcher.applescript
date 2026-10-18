-- よろずや.app の本体。起動でサーバを立て、終了でサーバを止める。
property serverPid : ""

on run
	set startScript to POSIX path of (path to me) & "Contents/Resources/start.sh"
	set serverPid to do shell script "/bin/bash " & quoted form of startScript
end run

on reopen
	do shell script "open http://127.0.0.1:4628/"
end reopen

on idle
	return 60
end idle

on quit
	if serverPid is not "" then
		do shell script "kill " & serverPid & " 2>/dev/null || true"
		set serverPid to ""
	end if
	continue quit
end quit
