import IP,time
def resolv_client(request):
	ip=request.META['REMOTE_ADDR']
	username=request.user.username
	now_time=time.strftime("%Y-%m-%d %H:%M:%S",time.localtime(time.time()))
	info={
		"ip":ip,
		"ip_locate":IP.find(ip),
		"time":now_time,
		"owner":username,
	}
	return info
