print "enter filename";
$filename=<STDIN>;
chop($filename);
if(-e $filename)
{
print"file $filename exists";
if(-B $filename)
{
print "binary";
}
else
{
print "not binary";
}}
else
{
print "file dosent exists";
}
