#include<stdio.h>
void findAndReplace(char*mainstr,char pattern,char replace)
{
for(int i=0;mainstr[i]!='\0';i++)
{
if(mainstr[i]==pattern)
{
mainstr[i]=replace;
}
}
}
int main()
{
char mainstr[100],pattern,replace;
printf(" entre the main string:\n");
scanf("%[^\n]",mainstr);
printf("enter the pattern to find:");
scanf("%c",&pattern);
printf("enter the replacement character:");
scanf("%c",&replace);
findAndReplace(mainstr,pattern,replace);
printf("\n the resulting string after replacement is:%s\n",mainstr);
return 0;
}
