document = JS.global[:window][:document]
main_rb = document.querySelector('.main-rb')[:value].to_s
rubocop_yml = document.querySelector('.rubocop-yml')[:value].to_s

tmp = "/home/me/tmp"
output = "#{tmp}/output"

FileUtils.mkdir_p(tmp)

File.write("#{tmp}/main.rb", main_rb)
File.write("#{tmp}/.rubocop.yml", rubocop_yml)

options = {
  cache: 'false',
  formatters: [['json', output]],
} 
config_store = RuboCop::ConfigStore.new
runner = RuboCop::Runner.new(options, config_store)

retried = 0
begin
  runner.run([tmp])
rescue Errno::ENOENT
  # FIXME: Fails unexpectedly the first few times
  if retried < 5
    retried += 1
    retry
  end
  raise
end

File.read(output)
